import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/storeSettings'

/** Public store info for checkout UI / contact widgets */
export async function GET() {
  try {
    const s = await getStoreSettings()
    return NextResponse.json({
      settings: {
        taxRate: s.taxRate,
        deliveryFee: s.deliveryFee,
        freeDeliveryMin: s.freeDeliveryMin,
        minOrder: s.minOrder,
        phone: s.phone,
        whatsapp: s.whatsapp,
        city: s.city,
        openHour: s.openHour,
        closeHour: s.closeHour,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
