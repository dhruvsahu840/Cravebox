import { NextResponse } from 'next/server'

import {
  getStoreSettings,
  storeStatusFromSettings,
} from '@/lib/storeSettings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const settings = await getStoreSettings()

  return NextResponse.json(
    storeStatusFromSettings(settings)
  )
}