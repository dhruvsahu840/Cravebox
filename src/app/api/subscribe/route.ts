import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { PushSubscription } from '@/models'

export async function POST(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Check logged-in user
    // ---------------------------------------------------------
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      )
    }

    // ---------------------------------------------------------
    // 2. Only admin can register admin push notifications
    // ---------------------------------------------------------
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 }
      )
    }

    // ---------------------------------------------------------
    // 3. Read subscription
    // ---------------------------------------------------------
    const subscription = await req.json()

    const endpoint = subscription?.endpoint
    const p256dh = subscription?.keys?.p256dh
    const auth = subscription?.keys?.auth

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid push subscription data',
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------------------
    // 4. Connect MongoDB
    // ---------------------------------------------------------
    await connectDB()

    // ---------------------------------------------------------
    // 5. Save/update subscription
    //
    // One browser/device endpoint = one database record.
    // If the same admin subscribes again, we update the
    // existing subscription instead of creating duplicates.
    // ---------------------------------------------------------
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: {
          p256dh,
          auth,
        },
        user: session.user.id,
        role: 'admin',
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Push subscription saved successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Push Subscribe Error]:', error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to save push subscription',
      },
      { status: 500 }
    )
  }
}