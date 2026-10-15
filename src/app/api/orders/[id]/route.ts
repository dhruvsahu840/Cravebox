import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order, User } from '@/models'
import { STORE } from '@/lib/config'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await connectDB()

    const order = await Order.findById(params.id).populate(
      'user',
      'name email phone'
    )

    if (!order) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    // Users can only see their own orders
    if (
      session.user.role !== 'admin' &&
      order.user &&
      order.user._id.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    console.error('[GET /api/orders/[id]] Error:', err)

    return NextResponse.json(
      {
        error: err?.message || 'Failed to fetch order',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/:id
// Admin updates status / delivery agent
// User can cancel pending orders or add rating
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await connectDB()

    const body = await req.json()

    console.log('[PATCH /api/orders/[id]] Request:', {
      orderId: params.id,
      role: session.user.role,
      body,
    })

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // ---------------------------------------------------------
    // ADMIN
    // ---------------------------------------------------------
    if (session.user.role === 'admin') {
      if (body.status) {
        order.status = body.status

        // Make sure old orders without statusHistory
        // do not crash the PATCH request.
        if (!Array.isArray(order.statusHistory)) {
          order.statusHistory = []
        }

        order.statusHistory.push({
          status: body.status,
          time: new Date(),
          note: body.note || '',
        })

        // Award loyalty points only when order becomes delivered
        if (body.status === 'delivered') {
          const user = await User.findById(order.user)

          if (user) {
            user.loyaltyPoints =
              (user.loyaltyPoints || 0) +
              Math.floor(order.total / 100) *
                STORE.loyaltyPointsPer100

            await user.save()
          }
        }
      }

      if (body.deliveryAgent) {
        order.deliveryAgent = body.deliveryAgent
      }

      if (body.deliveryLocation) {
        if (!order.deliveryAgent) {
          order.deliveryAgent = {
            name: '',
            phone: '',
          }
        }

        order.deliveryAgent.location = body.deliveryLocation
      }
    }

    // ---------------------------------------------------------
    // USER
    // ---------------------------------------------------------
    if (
      session.user.role === 'user' &&
      order.user.toString() === session.user.id
    ) {
      if (body.cancel && order.status === 'pending') {
        order.status = 'cancelled'

        if (!Array.isArray(order.statusHistory)) {
          order.statusHistory = []
        }

        order.statusHistory.push({
          status: 'cancelled',
          time: new Date(),
          note: 'Cancelled by user',
        })
      }

      if (body.rating && order.status === 'delivered') {
        order.rating = body.rating
      }
    }

    await order.save()

    console.log(
      '[PATCH /api/orders/[id]] Order updated successfully:',
      params.id
    )

    return NextResponse.json({ order })
  } catch (err: any) {
    console.error(
      '[PATCH /api/orders/[id]] ERROR:',
      err
    )

    return NextResponse.json(
      {
        error: err?.message || 'Failed to update order',
      },
      { status: 500 }
    )
  }
}

