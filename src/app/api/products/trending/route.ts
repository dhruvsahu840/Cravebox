import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Product, Order } from '@/models'

export async function GET() {
  try {
    await connectDB()
    const agg = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', count: { $sum: '$items.qty' } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ])
    const ids = agg.map(a => a._id)
    const products = await Product.find({ _id: { $in: ids }, isAvailable: true }).populate('category', 'name slug').lean()
    const sorted = ids.map(id => products.find(p => String(p._id) === String(id))).filter(Boolean)
    if (sorted.length < 4) {
      const extra = await Product.find({ isAvailable: true, isBestseller: true }).limit(8 - sorted.length).populate('category', 'name slug').lean()
      return NextResponse.json({ products: [...sorted, ...extra].slice(0, 8) })
    }
    return NextResponse.json({ products: sorted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
