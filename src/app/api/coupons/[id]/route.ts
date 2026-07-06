import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Coupon } from '@/models'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const body   = await req.json()
    const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json({ coupon })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await connectDB()
  await Coupon.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Deleted' })
}
