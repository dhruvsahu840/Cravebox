import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order } from '@/models'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// POST /api/payments/create-order — creates a Razorpay order
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { orderId } = await req.json()

    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.user.toString() !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const rzpOrder = await razorpay.orders.create({
      amount:   order.total * 100, // paise
      currency: 'INR',
      receipt:  order.orderNumber,
      notes:    { orderId: orderId, userId: session.user.id },
    })

    // Save rzp order id
    order.payment.razorpayOrderId = rzpOrder.id
    await order.save()

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
