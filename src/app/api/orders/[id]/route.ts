import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order } from '@/models'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const order = await Order.findById(params.id).populate('user', 'name email phone')
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Users can only see their own orders
    if (session.user.role !== 'admin' && order.user._id.toString() !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/orders/:id — admin updates status or delivery agent
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const body  = await req.json()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Admin can update status and delivery agent
    if (session.user.role === 'admin') {
      if (body.status) {
        order.status = body.status
        order.statusHistory.push({ status: body.status, time: new Date(), note: body.note || '' })
      }
      if (body.deliveryAgent) order.deliveryAgent = body.deliveryAgent
      if (body.deliveryLocation) {
        if (!order.deliveryAgent) order.deliveryAgent = { name: '', phone: '' }
        order.deliveryAgent.location = body.deliveryLocation
      }
    }

    // User can cancel pending orders or add rating
    if (session.user.role === 'user' && order.user.toString() === session.user.id) {
      if (body.cancel && order.status === 'pending') {
        order.status = 'cancelled'
        order.statusHistory.push({ status: 'cancelled', time: new Date(), note: 'Cancelled by user' })
      }
      if (body.rating && order.status === 'delivered') {
        order.rating = body.rating
      }
    }

    await order.save()
    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
