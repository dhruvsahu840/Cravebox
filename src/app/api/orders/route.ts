import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order, Product, Coupon } from '@/models'

// GET /api/orders — user gets their own, admin gets all
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

// POST /api/orders — place a new order
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { items, address, paymentMethod, specialInstructions, couponCode } = await req.json()

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!address)       return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })

    // Verify products + calculate totals server-side (never trust client prices)
    const productIds = items.map((i: any) => i.product)
    const products   = await Product.find({ _id: { $in: productIds } }).lean()

    const verifiedItems = items.map((item: any) => {
      const product = products.find((p: any) => p._id.toString() === item.product)
      if (!product) throw new Error(`Product not found: ${item.product}`)
      if (!product.isAvailable) throw new Error(`${product.name} is currently unavailable`)
      return {
        product: product._id,
        name:    product.name,
        image:   product.images?.[0] || '',
        price:   product.discountedPrice || product.price,
        qty:     item.qty,
        customizations: item.customizations || '',
      }
    })

    const subtotal    = verifiedItems.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    const deliveryFee = subtotal >= 299 ? 0 : 40
    const tax         = Math.round(subtotal * 0.05)

    // Verify coupon server-side — never trust a client-sent discount amount
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

    const total = subtotal + deliveryFee + tax - discount

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
      payment: {
        method: paymentMethod || 'cod',
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
      },
      statusHistory: [{ status: 'pending', time: new Date(), note: 'Order placed' }],
      estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000),
    })

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1
      await appliedCoupon.save()
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
