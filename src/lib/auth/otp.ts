import twilio from 'twilio'
import { connectDB } from '@/lib/db'
import { OtpSession } from '@/models'
import { sendWhatsApp, sendSms } from '@/lib/notify'
import { isValidIndianPhone, normalizePhone, toE164India } from '@/lib/auth/phone'

export type OtpPurpose = 'login' | 'link_phone'

export async function createAndSendOtp(opts: {
  phone: string
  name?: string
  purpose?: OtpPurpose
  userId?: string
}) {
  await connectDB()

  const phone = normalizePhone(opts.phone)

  if (!isValidIndianPhone(phone)) {
    return {
      ok: false as const,
      error: 'Enter a valid 10-digit Indian mobile number',
      status: 400,
      demoOtp: undefined as string | undefined,
    }
  }

  const purpose = opts.purpose || 'login'

  // Clean up existing pending sessions for this phone/purpose
  await OtpSession.deleteMany({ phone, purpose })

  // Save pending session metadata in MongoDB
  await OtpSession.create({
    phone,
    otpHash: 'TWILIO_VERIFY_MANAGED', // Handled remotely by Twilio Verify API
    name: (opts.name || '').trim().slice(0, 60),
    purpose,
    userId: opts.userId || undefined,
    attempts: 0,
    expiresAt: new Date(Date.now() + 10 * 60_000),
  })

  // Try WhatsApp Delivery via Twilio Verify
  const wa = await sendWhatsApp(phone)

  // Fallback to SMS via Twilio Verify if WhatsApp fails
  const sms = wa.ok ? { ok: true as const } : await sendSms(phone, 'Your Lifepizza verification code')

  const delivered = wa.ok || sms.ok

  if (!delivered) {
    return {
      ok: false as const,
      error: wa.error || sms.error || 'Could not send verification OTP',
      status: 503,
      demoOtp: undefined as string | undefined,
    }
  }

  return {
    ok: true as const,
    phone,
    message: wa.ok ? 'OTP sent on WhatsApp' : 'OTP sent via SMS',
    channel: wa.ok ? 'whatsapp' : 'sms',
    demoOtp: undefined as string | undefined,
  }
}

export async function verifyOtpCode(opts: {
  phone: string
  otp: string
  purpose?: string
}) {
  const code = String(opts.otp || '').trim()

  if (!isValidIndianPhone(opts.phone) || code.length < 4) {
    return {
      ok: false as const,
      error: 'Invalid phone or OTP code',
    }
  }

  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!sid || !token || !serviceSid) {
    return {
      ok: false as const,
      error: 'Twilio Verify settings unconfigured in environment',
    }
  }

  try {
    const client = twilio(sid, token)
    const formattedPhone = toE164India(opts.phone)

    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code: code,
      })

    if (check.status !== 'approved') {
      return {
        ok: false as const,
        error: 'Invalid or expired OTP code',
      }
    }

    return {
      ok: true as const,
      phone: opts.phone,
      name: undefined as string | undefined, // Added to fix type checking
    }
  } catch (err: any) {
    console.error('[verifyOtpCode Error]:', err?.message || err)
    return {
      ok: false as const,
      error: err?.message || 'Verification check failed',
      name: undefined as string | undefined,
    }
  }
}