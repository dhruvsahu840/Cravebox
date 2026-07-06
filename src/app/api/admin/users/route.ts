import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User, Order } from '@/models'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page')  || '1')
    const limit  = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const query: any = { role: 'user' }
    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query),
    ])

    // Attach order count for each user
    const userIds   = users.map((u: any) => u._id)
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, spent: { $sum: '$total' } } },
    ])
    const orderMap = Object.fromEntries(orderCounts.map((o: any) => [o._id.toString(), o]))

    const enriched = users.map((u: any) => ({
      ...u,
      orderCount: orderMap[u._id.toString()]?.count  || 0,
      totalSpent: orderMap[u._id.toString()]?.spent || 0,
    }))

    return NextResponse.json({ users: enriched, total, page, pages: Math.ceil(total / limit) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
