import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'

import { connectDB } from '@/lib/db'
import { OtpSession } from '@/models'
import {
  isValidIndianPhone,
  normalizePhone,
} from '@/lib/auth/phone'

export type OtpPurpose = 'login' | 'link_phone'

const OTP_EXPIRY_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

async function sendApitxtOtp(
  phone: string,
  otp: string
): Promise<{ ok: boolean; error?: string }> {
  const authKey = process.env.APITXT_AUTH_KEY

  if (!authKey) {
    return {
      ok: false,
      error: 'APITxT API key is not configured',
    }
  }

  try {
    const params = new URLSearchParams({
      authkey: authKey,
      mobile: `91${phone}`,
      otp,
      channel: 'sms',
    })

    const response = await fetch(
      `https://apitxt.com/api/sendOTP?${params.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      }
    )

    const data = await response.json()

    if (
      !response.ok ||
      String(data.status).toLowerCase() !== 'success'
    ) {
      console.error('[APITxT] OTP request failed:', {
        httpStatus: response.status,
        status: data.status,
        message: data.message,
      })

      return {
        ok: false,
        error: 'Could not send OTP. Please try again later.',
      }
    }

    console.log('[APITxT] OTP request accepted:', {
      requestId: data.data?.request_id,
      cost: data.data?.cost,
    })

    return { ok: true }
  } catch (error: any) {
    console.error(
      '[APITxT] Request error:',
      error?.message || 'Unknown error'
    )

    return {
      ok: false,
      error: 'OTP service is temporarily unavailable',
    }
  }
}

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
    }
  }

  const purpose = opts.purpose || 'login'
  const mockMode =
    process.env.APITXT_MOCK_MODE === 'true'

  const otp = String(randomInt(100000, 1000000))
  const otpHash = await bcrypt.hash(otp, 10)

  await OtpSession.deleteMany({ phone, purpose })

  const otpSession = await OtpSession.create({
    phone,
    otpHash,
    name: (opts.name || '').trim().slice(0, 60),
    purpose,
    userId: opts.userId || undefined,
    attempts: 0,
    verified: false,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  })

  if (mockMode) {
    // Development only. Never enable mock mode in production.
    console.info(`[OTP MOCK] ${phone}: ${otp}`)

    return {
      ok: true as const,
      phone,
      message: 'Development OTP generated. Check your terminal.',
      channel: 'mock',
    }
  }

  const delivery = await sendApitxtOtp(phone, otp)

  if (!delivery.ok) {
    await OtpSession.deleteOne({ _id: otpSession._id })

    return {
      ok: false as const,
      error: delivery.error || 'Could not send OTP',
      status: 503,
    }
  }

  return {
    ok: true as const,
    phone,
    message: 'OTP sent via SMS',
    channel: 'sms',
  }
}

export async function verifyOtpCode(opts: {
  phone: string
  otp: string
  purpose?: string
  userId?: string
}) {
  await connectDB()

  const phone = normalizePhone(opts.phone)
  const code = String(opts.otp || '').trim()
  const purpose = opts.purpose || 'login'

  if (!isValidIndianPhone(phone) || !/^\d{6}$/.test(code)) {
    return {
      ok: false as const,
      error: 'Invalid phone or OTP code',
    }
  }

  const query: Record<string, any> = {
    phone,
    purpose,
    expiresAt: { $gt: new Date() },
    verified: false,
  }

  // Phone-link OTPs must belong to the signed-in user
  // who requested them.
  if (opts.userId) {
    query.userId = opts.userId
  }

 const session = await OtpSession.findOne(query)

 console.log('[OTP VERIFY DEBUG]', {
  phone,
  purpose,
  otpLength: code.length,
  sessionFound: Boolean(session),
  sessionPhone: session?.phone,
  expiresAt: session?.expiresAt,
  attempts: session?.attempts,
  verified: session?.verified,
})



if (!session) {
  const latest: any = await OtpSession.findOne({
    phone,
    purpose,
  })
    .select('expiresAt verified attempts')
    .sort({ createdAt: -1 })
    .lean()
    .exec()

  console.warn('[OTP verify] No eligible OTP session:', {
    purpose,
    sessionFound: Boolean(latest),
    expired: latest?.expiresAt
      ? new Date(latest.expiresAt).getTime() <= Date.now()
      : null,
    verified: latest?.verified ?? null,
    attempts: latest?.attempts ?? null,
  })

  return {
    ok: false as const,
    error: 'OTP expired or not found. Please request a new one.',
  }
}



  if (session.attempts >= MAX_ATTEMPTS) {
    await OtpSession.deleteOne({ _id: session._id })

    return {
      ok: false as const,
      error: 'Too many incorrect attempts. Request a new OTP.',
    }
  }

  const matches = await bcrypt.compare(code, session.otpHash)

  console.log('[OTP HASH MATCH]', matches)

  if (!matches) {
    const updated = await OtpSession.findOneAndUpdate(
      {
        _id: session._id,
        attempts: { $lt: MAX_ATTEMPTS },
      },
      { $inc: { attempts: 1 } },
      { new: true }
    )

    if (updated && updated.attempts >= MAX_ATTEMPTS) {
      await OtpSession.deleteOne({ _id: session._id })
    }

    return {
      ok: false as const,
      error: 'Invalid OTP code',
    }
  }

  // Delete before returning success to prevent OTP reuse.
  const consumed = await OtpSession.deleteOne({
    _id: session._id,
  })

  if (consumed.deletedCount !== 1) {
    return {
      ok: false as const,
      error: 'OTP has already been used. Request a new one.',
    }
  }

  return {
    ok: true as const,
    phone,
    name: session.name || undefined,
  }
}
