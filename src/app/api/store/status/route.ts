import { NextResponse } from 'next/server'
import { storeStatusLabel } from '@/lib/config'

export async function GET() {
  return NextResponse.json(storeStatusLabel())
}
