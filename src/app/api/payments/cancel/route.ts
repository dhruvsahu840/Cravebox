import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order } from '@/models'

/** Mark unpaid online order as failed/cancelled when Razorpay is dismissed */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { orderId } = await req.json()
    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.payment.status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }
    if (order.payment.method !== 'razorpay') {
      return NextResponse.json({ error: 'Not an online payment order' }, { status: 400 })
    }

    order.payment.status = 'failed'
    order.status = 'cancelled'
    order.statusHistory.push({
      status: 'cancelled',
      time: new Date(),
      note: 'Payment cancelled / dismissed',
    })
    await order.save()

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
