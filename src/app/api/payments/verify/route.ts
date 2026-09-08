import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order, Coupon, User } from '@/models'
import { notifyAdminNewOrder } from '@/lib/notify'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
    }

    const body     = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (order.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.payment.razorpayOrderId && order.payment.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: 'Payment does not match this order' }, { status: 400 })
    }

    if (order.payment.status === 'paid') {
      return NextResponse.json({ success: true, order })
    }

    order.payment.status            = 'paid'
    order.payment.razorpayOrderId   = razorpay_order_id
    order.payment.razorpayPaymentId = razorpay_payment_id
    order.payment.razorpaySignature = razorpay_signature
    order.payment.paidAt            = new Date()
    // Stay pending until admin confirms — payment paid ≠ kitchen accepted
    if (order.status === 'pending') {
      order.statusHistory.push({ status: 'pending', time: new Date(), note: 'Payment received — awaiting confirmation' })
    }
    await order.save()

    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase(), isActive: true },
        { $inc: { usedCount: 1 } }
      )
    }

    const user = await User.findById(order.user).select('name phone').lean()
    notifyAdminNewOrder(order, user as any).catch(() => {})

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
