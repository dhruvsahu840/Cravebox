import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { createAndSendOtp } from '@/lib/auth/otp'

/** @deprecated Prefer /api/auth/otp/send — kept for compatibility */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`otp:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many OTP requests. Try again in a minute.' }, { status: 429 })
  }

  try {
    const { phone, name } = await req.json()
    const result = await createAndSendOtp({ phone, name, purpose: 'login' })
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 })
    }
    return NextResponse.json({
      ok: true,
      message: result.message,
      ...(result.demoOtp ? { demoOtp: result.demoOtp } : {}),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
