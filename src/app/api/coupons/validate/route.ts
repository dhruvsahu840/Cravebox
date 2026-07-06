import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Coupon } from '@/models'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { code, cartTotal } = await req.json()
    if (!code) return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true })
    if (!coupon) return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 404 })

    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })

    if (coupon.usedCount >= coupon.usageLimit)
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })

    if (cartTotal < coupon.minOrder)
      return NextResponse.json({ error: `Minimum order of ₹${coupon.minOrder} required` }, { status: 400 })

    // Calculate discount
    let discount = coupon.type === 'percent'
      ? Math.round((cartTotal * coupon.value) / 100)
      : coupon.value

    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

    return NextResponse.json({
      valid:    true,
      discount,
      coupon: {
        code:  coupon.code,
        type:  coupon.type,
        value: coupon.value,
      },
      message: `${coupon.type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`} applied!`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
