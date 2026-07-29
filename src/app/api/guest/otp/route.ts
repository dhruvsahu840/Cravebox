import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { OtpSession } from '@/models'
import { rateLimit } from '@/lib/rateLimit'
import { sendSms } from '@/lib/notify'
import bcrypt from 'bcryptjs'

function normalizePhone(phone: string) {
  return String(phone || '').replace(/\D/g, '').slice(-10)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`otp:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many OTP requests. Try again in a minute.' }, { status: 429 })
  }

  try {
    await connectDB()
    const { phone: rawPhone, name } = await req.json()
    const phone = normalizePhone(rawPhone)
    if (phone.length !== 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit phone number' }, { status: 400 })
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000))
    const otpHash = await bcrypt.hash(otp, 8)
    const expiresAt = new Date(Date.now() + 5 * 60_000)

    await OtpSession.deleteMany({ phone })
    await OtpSession.create({
      phone,
      otpHash,
      name: (name || 'Guest').trim().slice(0, 60),
      attempts: 0,
      expiresAt,
    })

    const sms = await sendSms(phone, `Your Lifepizza OTP is ${otp}. Valid for 5 minutes.`)
    const demo = process.env.ALLOW_DEMO_OTP === 'true' || process.env.NODE_ENV !== 'production'

    // Never expose OTP in production unless explicitly allowed
    if (!sms.ok && !demo) {
      return NextResponse.json({
        error: 'Could not send OTP. Please configure SMS (MSG91/Twilio) or try again.',
      }, { status: 503 })
    }

    return NextResponse.json({
      ok: true,
      message: sms.ok ? 'OTP sent to your phone' : 'OTP generated (demo mode — SMS not configured)',
      ...(demo && !sms.ok ? { demoOtp: otp } : {}),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
