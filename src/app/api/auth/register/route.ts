import { NextResponse } from 'next/server'

/** Public customer password signup is disabled. Use phone OTP. */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Public signup with password is disabled. Please sign in with Phone OTP.',
      code: 'SIGNUP_DISABLED',
    },
    { status: 403 }
  )
}
