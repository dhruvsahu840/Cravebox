import { NextResponse } from 'next/server'
import { getStoreSettings, storeStatusFromSettings } from '@/lib/storeSettings'

export async function GET() {
  const settings = await getStoreSettings()
  return NextResponse.json(storeStatusFromSettings(settings))
}
