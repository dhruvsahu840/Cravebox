import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order } from '@/models'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await connectDB()
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 }).limit(500).lean()
    const header = 'Order Number,Customer,Email,Phone,Status,Total,Items,Date,Address\n'
    const rows = orders.map(o => [
      o.orderNumber,
      (o.user as any)?.name || '',
      (o.user as any)?.email || '',
      (o.user as any)?.phone || '',
      o.status,
      o.total,
      o.items.map((i: any) => `${i.qty}x ${i.name}`).join('; '),
      new Date(o.createdAt).toISOString(),
      `"${o.address?.line1}, ${o.address?.city} ${o.address?.pincode}"`,
    ].join(','))
    const csv = header + rows.join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="cravebox-orders.csv"',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
