import twilio from 'twilio'
import webpush from 'web-push'

import { getStoreSettings } from '@/lib/storeSettings'
import { connectDB } from '@/lib/db'
import { PushSubscription } from '@/models'
import { toE164India } from './auth/phone'

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) return `91${digits}`

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits
  }

  if (digits.length > 10) {
    return `91${digits.slice(-10)}`
  }

  return digits
}

/**
 * Triggers WhatsApp verification OTP via Twilio Verify Service
 */
export async function sendWhatsApp(to: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!to) {
    return {
      ok: false,
      error: 'No phone provided',
    }
  }

  if (!sid || !token || !serviceSid) {
    return {
      ok: false,
      error: 'Twilio Verify credentials missing in process.env',
    }
  }

  try {
    const client = twilio(sid, token)

    const formattedPhone = toE164India(to)

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'whatsapp',
      })

    return {
      ok: true,
      sid: verification.sid,
    }
  } catch (err: any) {
    console.error(
      '[Twilio WhatsApp Verify Error]:',
      err?.message || err
    )

    return {
      ok: false,
      error: err?.message || 'WhatsApp verification failed',
    }
  }
}

/**
 * Triggers SMS verification OTP via Twilio Verify Service
 */
export async function sendSms(to: string, p0: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!to || !sid || !token || !serviceSid) {
    return {
      ok: false,
      error: 'Twilio Verify credentials missing in process.env',
    }
  }

  try {
    const client = twilio(sid, token)

    const formattedPhone = toE164India(to)

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      })

    return {
      ok: true,
      sid: verification.sid,
    }
  } catch (err: any) {
    console.error(
      '[Twilio SMS Verify Error]:',
      err?.message || err
    )

    return {
      ok: false,
      error: err?.message || 'SMS verification failed',
    }
  }
}

/**
 * Formats order notification alert.
 */
export function formatOrderAlert(order: {
  orderNumber?: string
  total?: number
  payment?: {
    method?: string
    status?: string
  }
  items?: {
    name: string
    qty: number
    customizations?: string
  }[]
  address?: {
    line1?: string
    city?: string
    pincode?: string
  }
  userName?: string
  userPhone?: string
}) {
  const lines = (order.items || [])
    .slice(0, 8)
    .map(
      (i) =>
        `• ${i.qty}x ${i.name}${
          i.customizations
            ? ` (${i.customizations})`
            : ''
        }`
    )
    .join('\n')

  const addr = [
    order.address?.line1,
    order.address?.city,
    order.address?.pincode,
  ]
    .filter(Boolean)
    .join(', ')

  return [
    `🍕 *New LifePizza order #${order.orderNumber || ''}*`,

    `Customer: ${
      order.userName || 'Guest'
    }${
      order.userPhone
        ? ` · ${order.userPhone}`
        : ''
    }`,

    `Pay: ${(
      order.payment?.method || 'cod'
    ).toUpperCase()} (${
      order.payment?.status || 'pending'
    })`,

    `Total: ₹${order.total ?? 0}`,

    lines
      ? `\n*Items:*\n${lines}`
      : '',

    addr
      ? `\nAddress: ${addr}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Configure Web Push using VAPID credentials.
 */
function configureWebPush() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  const privateKey =
    process.env.VAPID_PRIVATE_KEY

  const subject =
    process.env.VAPID_SUBJECT

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      'Web Push VAPID environment variables are missing'
    )
  }

  webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey
  )
}

/**
 * Sends a browser push notification to all
 * registered admin devices.
 */
async function sendAdminPushNotification(
  title: string,
  body: string,
  url: string
) {
  await connectDB()

  configureWebPush()

  const subscriptions =
    await PushSubscription.find({
      role: 'admin',
    }).lean()

  if (!subscriptions.length) {
    console.warn(
      '[Web Push] No admin subscriptions found'
    )

    return
  }

  const payload = JSON.stringify({
    title,
    body,
    icon: '/icon.png',
    url,
  })

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh:
                subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          payload
        )

        console.log(
          `[Web Push] Notification sent to admin subscription`
        )
      } catch (error: any) {
        console.error(
          '[Web Push] Failed to send notification:',
          error?.message || error
        )

        /**
         * 404 / 410 means the browser subscription
         * is no longer valid.
         *
         * Remove it from MongoDB so future notifications
         * don't keep trying to use a dead subscription.
         */
        if (
          error?.statusCode === 404 ||
          error?.statusCode === 410
        ) {
          await PushSubscription.deleteOne({
            _id: subscription._id,
          })

          console.log(
            '[Web Push] Removed expired subscription'
          )
        }
      }
    })
  )
}

/**
 * Admin notification when a new order is created.
 */
export async function notifyAdminNewOrder(
  order: any,
  user?: {
    name?: string
    phone?: string
  } | null
) {
  try {
    const settings =
      await getStoreSettings()

    const to =
      settings.adminNotifyPhone ||
      settings.whatsapp ||
      settings.phone

    const message = formatOrderAlert({
      orderNumber:
        order.orderNumber,

      total:
        order.total,

      payment:
        order.payment,

      items:
        order.items,

      address:
        order.address,

      userName:
        user?.name ||
        order.user?.name,

      userPhone:
        user?.phone ||
        order.user?.phone,
    })

    /**
     * Web Push notification
     *
     * This does NOT depend on Twilio,
     * WhatsApp or SMS.
     */
    await sendAdminPushNotification(
      '🍕 New LifePizza Order!',
      message,
      '/admin/orders'
    )

    /**
     * Keep this information for the existing
     * notification/WhatsApp flow.
     */
    if (!to) {
      console.warn(
        '[notify] No adminNotifyPhone configured in store settings'
      )
    }

    console.log(
      '[notifyAdminNewOrder] Admin push notification processed'
    )
  } catch (err: any) {
    console.error(
      '[notify] Admin alert failed:',
      err?.message || err
    )
  }
}