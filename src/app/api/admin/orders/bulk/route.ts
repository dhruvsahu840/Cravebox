import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order } from '@/models'
import { rateLimit } from '@/lib/rateLimit'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`bulk:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    await connectDB()
    const { orderIds, status } = await req.json()
    if (!orderIds?.length || !status) {
      return NextResponse.json({ error: 'orderIds and status required' }, { status: 400 })
    }
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status }, $push: { statusHistory: { status, time: new Date(), note: 'Bulk update' } } }
    )
    return NextResponse.json({ ok: true, updated: orderIds.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
