import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { rateLimit } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'

const otpStore = new Map<string, { otp: string; name: string; expires: number }>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`otp:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many OTP requests' }, { status: 429 })
  }

  try {
    await connectDB()
    const { phone, name } = await req.json()
    if (!phone || phone.length < 10) return NextResponse.json({ error: 'Valid phone required' }, { status: 400 })

    const otp = String(Math.floor(1000 + Math.random() * 9000))
    otpStore.set(phone, { otp, name, expires: Date.now() + 5 * 60_000 })

    const email = `guest_${phone}@cravebox.local`
    const password = `guest_${phone}`
    const existing = await User.findOne({ email })
    if (!existing) {
      const hash = await bcrypt.hash(password, 10)
      await User.create({ name: name || 'Guest', email, phone, password: hash, role: 'user' })
    }

    return NextResponse.json({ ok: true, otp })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
