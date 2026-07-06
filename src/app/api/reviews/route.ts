import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Review, Product, Order } from '@/models'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product')
  if (!productId) return NextResponse.json({ error: 'product param required' }, { status: 400 })

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20)
  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { productId, orderId, rating, comment } = await req.json()

    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })

    // Check user actually ordered this product
    const order = await Order.findOne({
      _id:    orderId,
      user:   session.user.id,
      status: 'delivered',
      'items.product': productId,
    })
    if (!order)
      return NextResponse.json({ error: 'You can only review products you have ordered and received' }, { status: 403 })

    // Prevent duplicate review
    const existing = await Review.findOne({ product: productId, user: session.user.id, order: orderId })
    if (existing)
      return NextResponse.json({ error: 'You have already reviewed this product for this order' }, { status: 409 })

    const review = await Review.create({
      product: productId,
      user:    session.user.id,
      order:   orderId,
      rating,
      comment,
    })

    // Update product avg rating
    const all = await Review.find({ product: productId })
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length
    await Product.findByIdAndUpdate(productId, {
      'ratings.avg':   Math.round(avg * 10) / 10,
      'ratings.count': all.length,
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
