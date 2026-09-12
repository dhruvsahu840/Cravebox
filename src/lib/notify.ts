import twilio from 'twilio'
import { getStoreSettings } from '@/lib/storeSettings'
import { toE164India } from './auth/phone'

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  // If 10 digits, add '91'
  if (digits.length === 10) return `91${digits}`
  // If user entered 12 digits starting with '91' (+91XXXXXXXXXX)
  if (digits.length === 12 && digits.startsWith('91')) return digits
  // Fallback: handle edge case where trailing 10 digits are extracted
  if (digits.length > 10) return `91${digits.slice(-10)}`
  return digits
}

/**
 * Triggers WhatsApp verification OTP via Twilio Verify Service
 */
export async function sendWhatsApp(to: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!to) return { ok: false, error: 'No phone provided' }
  if (!sid || !token || !serviceSid) {
    return { ok: false, error: 'Twilio Verify credentials missing in process.env' }
  }

  try {
    const client = twilio(sid, token)
    const formattedPhone = toE164India(to) // Produces +918602355924

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'whatsapp',
      })

    return { ok: true, sid: verification.sid }
  } catch (err: any) {
    console.error('[Twilio WhatsApp Verify Error]:', err?.message || err)
    return { ok: false, error: err?.message || 'WhatsApp verification failed' }
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
    return { ok: false, error: 'Twilio Verify credentials missing in process.env' }
  }

  try {
    const client = twilio(sid, token)
    const formattedPhone = toE164India(to) // Produces +918602355924

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      })

    return { ok: true, sid: verification.sid }
  } catch (err: any) {
    console.error('[Twilio SMS Verify Error]:', err?.message || err)
    return { ok: false, error: err?.message || 'SMS verification failed' }
  }
}

/**
 * Formats order notification alert string for admins
 */
export function formatOrderAlert(order: {
  orderNumber?: string
  total?: number
  payment?: { method?: string; status?: string }
  items?: { name: string; qty: number; customizations?: string }[]
  address?: { line1?: string; city?: string; pincode?: string }
  userName?: string
  userPhone?: string
}) {
  const lines = (order.items || [])
    .slice(0, 8)
    .map(i => `• ${i.qty}x ${i.name}${i.customizations ? ` (${i.customizations})` : ''}`)
    .join('\n')
  const addr = [order.address?.line1, order.address?.city, order.address?.pincode].filter(Boolean).join(', ')
  return [
    `🍕 *New LifePizza order #${order.orderNumber || ''}*`,
    `Customer: ${order.userName || 'Guest'}${order.userPhone ? ` · ${order.userPhone}` : ''}`,
    `Pay: ${(order.payment?.method || 'cod').toUpperCase()} (${order.payment?.status || 'pending'})`,
    `Total: ₹${order.total ?? 0}`,
    lines ? `\n*Items:*\n${lines}` : '',
    addr ? `\nAddress: ${addr}` : '',
  ].filter(Boolean).join('\n')
}

/**
 * Admin Notification trigger
 */
export async function notifyAdminNewOrder(order: any, user?: { name?: string; phone?: string } | null) {
  try {
    const settings = await getStoreSettings()
    const to = settings.adminNotifyPhone || settings.whatsapp || settings.phone
    if (!to) {
      console.warn('[notify] No adminNotifyPhone configured in store settings')
      return
    }
    const message = formatOrderAlert({
      orderNumber: order.orderNumber,
      total: order.total,
      payment: order.payment,
      items: order.items,
      address: order.address,
      userName: user?.name || order.user?.name,
      userPhone: user?.phone || order.user?.phone,
    })
    console.log('[notifyAdminNewOrder]: Message ready for delivery', message)
  } catch (err: any) {
    console.error('[notify] Admin alert failed:', err?.message)
  }
}