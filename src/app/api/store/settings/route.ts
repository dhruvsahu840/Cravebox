import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/storeSettings'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json({ settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
