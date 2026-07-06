import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { Order } from '@/models'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json()

    // Verify signature
    const body     = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })

    // Update order
    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    order.payment.status            = 'paid'
    order.payment.razorpayPaymentId = razorpay_payment_id
    order.payment.razorpaySignature = razorpay_signature
    order.payment.paidAt            = new Date()
    order.status                    = 'confirmed'
    order.statusHistory.push({ status: 'confirmed', time: new Date(), note: 'Payment received' })

    await order.save()
    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
