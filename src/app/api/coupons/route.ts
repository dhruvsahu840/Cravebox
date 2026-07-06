import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Coupon } from '@/models'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await connectDB()
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const body   = await req.json()
    const coupon = await Coupon.create({ ...body, code: body.code.toUpperCase() })
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
