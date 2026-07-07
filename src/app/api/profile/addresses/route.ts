import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { label, line1, city, pincode, isDefault } = await req.json()
    if (!line1 || !city || !pincode) {
      return NextResponse.json({ error: 'All address fields required' }, { status: 400 })
    }

    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (isDefault) {
      user.addresses.forEach((a: any) => { a.isDefault = false })
    }

    user.addresses.push({ label: label || 'Home', line1, city, pincode, isDefault: !!isDefault || user.addresses.length === 0 })
    await user.save()

    return NextResponse.json({ addresses: user.addresses })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Address id required' }, { status: 400 })

    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    user.addresses = user.addresses.filter((a: any) => a._id.toString() !== id) as any
    if (user.addresses.length && !user.addresses.some((a: any) => a.isDefault)) {
      user.addresses[0].isDefault = true
    }
    await user.save()

    return NextResponse.json({ addresses: user.addresses })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { id } = await req.json()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    user.addresses.forEach((a: any) => { a.isDefault = a._id.toString() === id })
    await user.save()

    return NextResponse.json({ addresses: user.addresses })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
