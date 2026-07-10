import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Newsletter } from '@/models'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`newsletter:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    await connectDB()
    const { email } = await req.json()
    if (!email?.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { email: email.toLowerCase() }, { upsert: true })
    return NextResponse.json({ ok: true, message: 'You\'re on the list! Check your inbox for 10% off.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
