import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Product, Order } from '@/models'

export async function GET(req: NextRequest) {
  const productId = new URL(req.url).searchParams.get('productId')
  if (!productId) return NextResponse.json({ products: [] })

  try {
    await connectDB()
    const orders = await Order.find({ 'items.product': productId, status: 'delivered' }).limit(50).lean()
    const counts = new Map<string, number>()
    for (const o of orders) {
      for (const item of o.items) {
        const id = String(item.product)
        if (id !== productId) counts.set(id, (counts.get(id) || 0) + item.qty)
      }
    }
    const topIds = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id)
    const products = await Product.find({ _id: { $in: topIds }, isAvailable: true }).lean()
    if (products.length < 2) {
      const fallback = await Product.find({ isAvailable: true, isFeatured: true, _id: { $ne: productId } }).limit(4).lean()
      return NextResponse.json({ products: fallback })
    }
    return NextResponse.json({ products: topIds.map(id => products.find(p => String(p._id) === id)).filter(Boolean) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
