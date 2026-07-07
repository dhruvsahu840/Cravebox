import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Order, Product } from '@/models'

type ReorderItem = { product: string; qty: number }
type ReorderOrder = { items: ReorderItem[] }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { orderId } = await req.json()
    const order = await Order.findOne({ _id: orderId, user: session.user.id }).lean() as ReorderOrder | null
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const productIds = order.items.map(i => i.product)
    const products = await Product.find({ _id: { $in: productIds }, isAvailable: true }).lean()

    const items = order.items
      .map(item => {
        const product = products.find(p => String(p._id) === String(item.product))
        if (!product) return null
        return {
          _id: String(product._id),
          name: product.name,
          price: product.discountedPrice || product.price,
          image: product.images?.[0] || '',
          qty: item.qty,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
