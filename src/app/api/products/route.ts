import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Product } from '@/models'

// GET /api/products
// Public storefront: only available products
// Admin panel: all products
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin'

    const { searchParams } = new URL(req.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const page = Math.max(
      1,
      parseInt(searchParams.get('page') || '1', 10)
    )
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    )

    // Public users should only see available products.
    // Admin should see all products.
    const query: Record<string, any> = isAdmin
      ? {}
      : { isAvailable: true }

    if (category) {
      query.category = category
    }

    if (featured === '1') {
      query.isFeatured = true
    }

    if (search) {
      const escaped = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )

      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } },
      ]
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err: any) {
    console.error('[GET /api/products] Error:', err)

    return NextResponse.json(
      {
        error: err?.message || 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  try {
    await connectDB()

    const body = await req.json()

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (
      body.price === undefined ||
      body.price === null ||
      body.price === ''
    ) {
      return NextResponse.json(
        { error: 'Product price is required' },
        { status: 400 }
      )
    }

    const name = String(body.name).trim()

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const exists = await Product.findOne({ slug })

    const finalSlug = exists
      ? `${slug}-${Date.now()}`
      : slug

    // Ensure new products are available by default
    // unless the admin explicitly sends false.
    const productData = {
      ...body,
      name,
      slug: finalSlug,
      isAvailable: body.isAvailable !== false,
    }

    const product = await Product.create(productData)

    console.log(
      '[POST /api/products] Product created:',
      String(product._id),
      product.name
    )

    return NextResponse.json(
      { product },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[POST /api/products] Error:', err)

    return NextResponse.json(
      {
        error: err?.message || 'Failed to create product',
      },
      { status: 500 }
    )
  }
}