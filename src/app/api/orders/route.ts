import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order, Product, Coupon, User } from '@/models'
import { getStoreSettings, calcDeliveryFee, calcTax, isStoreOpenNow } from '@/lib/storeSettings'
import { hasSizeOptions, resolveUnitPrice } from '@/lib/productPricing'
import { notifyAdminNewOrder } from '@/lib/notify'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page  = parseInt(searchParams.get('page')  || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const query: any = session.user.role === 'admin' ? {} : { user: session.user.id }
    if (status) query.status = status

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { items, address, paymentMethod, specialInstructions, couponCode, scheduledFor, useLoyalty } = await req.json()

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!address)       return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })

    const settings = await getStoreSettings()
    if (!scheduledFor && !isStoreOpenNow(settings)) {
      return NextResponse.json({
        error: `Store is closed. Open ${settings.openHour}:00 – ${settings.closeHour}:00`,
      }, { status: 400 })
    }

    // Customers must have a verified phone before ordering
    if (session.user.role !== 'admin') {
      const orderingUser = await User.findById(session.user.id).select('phone phoneVerified role')
      if (!orderingUser?.phone || !orderingUser.phoneVerified) {
        return NextResponse.json({
          error: 'Verify your phone number with WhatsApp OTP before placing an order',
          code: 'PHONE_REQUIRED',
        }, { status: 403 })
      }
    }

    const productIds = items.map((i: any) => i.product)
    const products: any[] = await Product.find({ _id: { $in: productIds } }).lean()

    const verifiedItems = items.map((item: any) => {
      const product = products.find((p) => p._id.toString() === item.product)
      if (!product) throw new Error(`Product not found: ${item.product}`)
      if (!product.isAvailable) throw new Error(`${product.name} is currently unavailable`)

      const customizations = item.customizations || ''
      if (hasSizeOptions(product.customizations) && !/size\s*:/i.test(customizations)) {
        throw new Error(`Please select a size for ${product.name}`)
      }

      return {
        product: product._id,
        name:    product.name,
        image:   product.images?.[0] || '',
        price:   resolveUnitPrice(product, customizations),
        qty:     item.qty,
        customizations,
      }
    })

    const subtotal = verifiedItems.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    if (subtotal < settings.minOrder) {
      return NextResponse.json({ error: `Minimum order is ₹${settings.minOrder}` }, { status: 400 })
    }
    const deliveryFee = calcDeliveryFee(subtotal, settings)
    const tax         = calcTax(subtotal, settings)

    let discount   = 0
    let appliedCoupon: any = null
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true })
      if (coupon && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
        appliedCoupon = coupon
      }
    }

    if (useLoyalty) {
      const user = await User.findById(session.user.id)
      if (user && user.loyaltyPoints >= 100) {
        const loyaltyDiscount = Math.min(Math.floor(user.loyaltyPoints / 10), Math.round(subtotal * 0.2))
        discount += loyaltyDiscount
        user.loyaltyPoints -= loyaltyDiscount * 10
        await user.save()
      }
    }

    const total = subtotal + deliveryFee + tax - discount
    const method = paymentMethod === 'razorpay' ? 'razorpay' : 'cod'
    const estimated = scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 35 * 60 * 1000)

    const order = await Order.create({
      user:                session.user.id,
      items:               verifiedItems,
      address,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      specialInstructions,
      couponCode:          appliedCoupon?.code,
      scheduledFor:        scheduledFor ? new Date(scheduledFor) : undefined,
      payment: {
        method,
        status: 'pending',
      },
      status: method === 'cod' ? 'confirmed' : 'pending',
      statusHistory: [{
        status: method === 'cod' ? 'confirmed' : 'pending',
        time: new Date(),
        note: method === 'cod' ? 'Order placed (Cash on delivery)' : 'Awaiting online payment',
      }],
      estimatedDelivery: estimated,
    })

    // Only burn coupon for COD now; Razorpay burns after successful verify
    if (appliedCoupon && method === 'cod') {
      appliedCoupon.usedCount += 1
      await appliedCoupon.save()
    }

    if (method === 'cod') {
      const user = await User.findById(session.user.id).select('name phone').lean()
      notifyAdminNewOrder(order, user as any).catch(() => {})
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
