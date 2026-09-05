import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { OtpSession } from '@/models'
import { sendWhatsApp, sendSms } from '@/lib/notify'
import { isValidIndianPhone, normalizePhone } from '@/lib/auth/phone'

export type OtpPurpose = 'login' | 'link_phone'

const OTP_TTL_MS = 5 * 60_000
const MAX_ATTEMPTS = 5

export async function createAndSendOtp(opts: {
  phone: string
  name?: string
  purpose?: OtpPurpose
  userId?: string
}) {
  await connectDB()
  const phone = normalizePhone(opts.phone)
  if (!isValidIndianPhone(phone)) {
    return { ok: false as const, error: 'Enter a valid 10-digit Indian mobile number', status: 400 }
  }

  const otp = String(Math.floor(1000 + Math.random() * 9000))
  const otpHash = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)
  const purpose = opts.purpose || 'login'

  await OtpSession.deleteMany({ phone, purpose })
  await OtpSession.create({
    phone,
    otpHash,
    name: (opts.name || '').trim().slice(0, 60),
    purpose,
    userId: opts.userId || undefined,
    attempts: 0,
    expiresAt,
  })

  const message = `Your LifePizza OTP is ${otp}. Valid for 5 minutes. Do not share this code.`
  const wa = await sendWhatsApp(phone, message)
  const sms = wa.ok ? { ok: true as const } : await sendSms(phone, message)
  const delivered = wa.ok || sms.ok

  const demo = process.env.ALLOW_DEMO_OTP === 'true'
  if (!delivered && !demo) {
    return {
      ok: false as const,
      error: 'Could not send WhatsApp OTP. Configure TWILIO_WHATSAPP_FROM (or SMS fallback).',
      status: 503,
    }
  }

  return {
    ok: true as const,
    phone,
    message: delivered
      ? (wa.ok ? 'OTP sent on WhatsApp' : 'OTP sent via SMS')
      : 'OTP generated (demo mode — WhatsApp/SMS not configured)',
    channel: wa.ok ? 'whatsapp' : sms.ok ? 'sms' : 'demo',
    ...(demo && !delivered ? { demoOtp: otp } : {}),
  }
}

export async function verifyOtpCode(opts: {
  phone: string
  otp: string
  purpose?: OtpPurpose
}) {
  await connectDB()
  const phone = normalizePhone(opts.phone)
  const otp = String(opts.otp || '').trim()
  const purpose = opts.purpose || 'login'

  if (!isValidIndianPhone(phone) || otp.length < 4) {
    return { ok: false as const, error: 'Invalid phone or OTP' }
  }

  const session = await OtpSession.findOne({ phone, purpose }).sort({ createdAt: -1 })
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: 'OTP expired. Request a new one.' }
  }
  if (session.attempts >= MAX_ATTEMPTS) {
    return { ok: false as const, error: 'Too many attempts. Request a new OTP.' }
  }

  const valid = await bcrypt.compare(otp, session.otpHash)
  if (!valid) {
    session.attempts += 1
    await session.save()
    return { ok: false as const, error: 'Invalid OTP' }
  }

  const name = session.name || ''
  const userId = session.userId?.toString()
  await OtpSession.deleteMany({ phone, purpose })
  return { ok: true as const, phone, name, userId }
}
