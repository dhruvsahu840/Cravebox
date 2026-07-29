import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, token, password } = await req.json()
    if (!email || !token || !password || String(password).length < 6) {
      return NextResponse.json({ error: 'Email, token, and password (min 6 chars) required' }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +resetToken +resetTokenExpires')
    if (!user?.resetToken || !user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Reset link expired or invalid' }, { status: 400 })
    }

    const valid = await bcrypt.compare(token, user.resetToken)
    if (!valid) return NextResponse.json({ error: 'Reset link expired or invalid' }, { status: 400 })

    user.password = await bcrypt.hash(password, 10)
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    return NextResponse.json({ ok: true, message: 'Password updated. You can sign in now.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
