import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Product } from '@/models'

// GET /api/products — public, supports ?category=&search=&featured=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)

    const query: any = { isAvailable: true }
    const category  = searchParams.get('category')
    const search    = searchParams.get('search')
    const featured  = searchParams.get('featured')
    const page      = parseInt(searchParams.get('page')  || '1')
    const limit     = parseInt(searchParams.get('limit') || '20')

    if (category)          query.category = category
    if (featured === '1')  query.isFeatured = true
    if (search)            query.name = { $regex: search, $options: 'i' }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await connectDB()
    const body = await req.json()

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const exists = await Product.findOne({ slug })
    const finalSlug = exists ? `${slug}-${Date.now()}` : slug

    const product = await Product.create({ ...body, slug: finalSlug })
    return NextResponse.json({ product }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
