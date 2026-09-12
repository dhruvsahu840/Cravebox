import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { createAndSendOtp, OtpPurpose } from '@/lib/auth/otp'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`auth-otp:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many OTP requests. Try again in a minute.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const purpose = (body.purpose === 'link_phone' ? 'link_phone' : 'login') as OtpPurpose

    let userId: string | undefined
    if (purpose === 'link_phone') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Sign in first to link your phone' }, { status: 401 })
      }
      if (session.user.role === 'admin') {
        return NextResponse.json({ error: 'Admins do not link phone this way' }, { status: 400 })
      }
      userId = session.user.id
    }

    const result = await createAndSendOtp({
      phone: body.phone,
      name: body.name,
      purpose,
      userId,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 })
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      channel: result.channel,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 })
  }
}