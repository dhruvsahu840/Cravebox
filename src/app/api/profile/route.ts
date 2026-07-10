import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    let user = await User.findById(session.user.id).select('-password').lean()
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() }).select('-password').lean()
    }
    if (!user) return NextResponse.json({ error: 'User not found. Please sign in again.' }, { status: 401 })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const body = await req.json()
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name: body.name, phone: body.phone },
      { new: true }
    ).select('-password')
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
