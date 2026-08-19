import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { verifyOtpCode } from '@/lib/auth/otp'
import { normalizePhone } from '@/lib/auth/phone'
import { rateLimit } from '@/lib/rateLimit'

/** Link + verify phone for Google (or other) customers already signed in. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`auth-link:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role === 'admin') {
    return NextResponse.json({ error: 'Not applicable for admin accounts' }, { status: 400 })
  }

  try {
    const { phone, otp, name } = await req.json()
    const result = await verifyOtpCode({ phone, otp, purpose: 'link_phone' })
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await connectDB()
    const normalized = normalizePhone(result.phone)

    const phoneOwner = await User.findOne({ phone: normalized })
    if (phoneOwner && phoneOwner._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'This phone is already linked to another account' }, { status: 409 })
    }

    const user = await User.findById(session.user.id)
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    user.phone = normalized
    user.phoneVerified = true
    if (name?.trim()) user.name = name.trim().slice(0, 60)
    await user.save()

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        phoneVerified: true,
        email: user.email || '',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to verify phone' }, { status: 500 })
  }
}
