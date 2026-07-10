import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreSettings, updateStoreSettings } from '@/lib/storeSettings'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const settings = await getStoreSettings()
    return NextResponse.json({ settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const taxRate = body.taxRate !== undefined
      ? (body.taxRate > 1 ? body.taxRate / 100 : body.taxRate)
      : undefined

    const settings = await updateStoreSettings({
      taxRate,
      deliveryFee: body.deliveryFee,
      freeDeliveryMin: body.freeDeliveryMin,
      minOrder: body.minOrder,
    })
    return NextResponse.json({ settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
