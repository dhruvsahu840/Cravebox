import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { rateLimit } from '@/lib/rateLimit'
import { sendSms } from '@/lib/notify'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`reset:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    await connectDB()
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password phone')
    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ ok: true, message: 'If that email exists, reset instructions were sent.' })
    }

    const token = crypto.randomBytes(24).toString('hex')
    user.resetToken = await bcrypt.hash(token, 8)
    user.resetTokenExpires = new Date(Date.now() + 30 * 60_000)
    await user.save()

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const link = `${base}/auth/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`

    // Prefer SMS if phone on file; otherwise return link in non-production for testing
    if (user.phone) {
      await sendSms(user.phone, `Lifepizza password reset: ${link}`)
    }

    const demo = process.env.ALLOW_DEMO_OTP === 'true' || process.env.NODE_ENV !== 'production'
    return NextResponse.json({
      ok: true,
      message: user.phone
        ? 'Reset link sent to your registered phone via SMS.'
        : 'If that email exists, reset instructions were sent.',
      ...(demo ? { demoResetLink: link } : {}),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
