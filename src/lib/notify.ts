import { getStoreSettings } from '@/lib/storeSettings'

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  return digits
}

async function twilioSend(to: string, body: string, channel: 'sms' | 'whatsapp') {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const fromSms = process.env.TWILIO_PHONE_NUMBER
  const fromWa = process.env.TWILIO_WHATSAPP_FROM || (fromSms ? `whatsapp:${fromSms}` : '')
  if (!sid || !token) return { ok: false, error: 'Twilio not configured' }

  const from = channel === 'whatsapp' ? fromWa : fromSms
  if (!from) return { ok: false, error: `Twilio ${channel} from-number missing` }

  const toAddr = channel === 'whatsapp'
    ? (to.startsWith('whatsapp:') ? to : `whatsapp:+${normalizePhone(to)}`)
    : `+${normalizePhone(to)}`

  const auth = Buffer.from(`${sid}:${token}`).toString('base64')
  const params = new URLSearchParams({ To: toAddr, From: from, Body: body })
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  if (!res.ok) {
    const err = await res.text()
    return { ok: false, error: err.slice(0, 300) }
  }
  return { ok: true }
}

async function msg91SendSms(to: string, body: string) {
  const key = process.env.MSG91_AUTH_KEY
  const sender = process.env.MSG91_SENDER || 'LIFEPZ'
  if (!key) return { ok: false, error: 'MSG91 not configured' }

  const mobile = normalizePhone(to)
  const res = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authkey: key,
    },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: '0',
      recipients: [{ mobiles: mobile, VAR1: body.slice(0, 30) }],
      // fallback simple SMS if template not set — use legacy endpoint below
    }),
  })

  // Prefer simple SMS API when no template configured
  if (!process.env.MSG91_TEMPLATE_ID) {
    const simple = await fetch(
      `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(key)}&mobiles=${mobile}&message=${encodeURIComponent(body)}&sender=${encodeURIComponent(sender)}&route=4&country=91`
    )
    return { ok: simple.ok, error: simple.ok ? undefined : await simple.text() }
  }

  if (!res.ok) return { ok: false, error: (await res.text()).slice(0, 300) }
  return { ok: true }
}

export async function sendSms(to: string, body: string) {
  if (!to) return { ok: false, error: 'No phone' }
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_PHONE_NUMBER) {
      return await twilioSend(to, body, 'sms')
    }
    if (process.env.MSG91_AUTH_KEY) {
      return await msg91SendSms(to, body)
    }
    console.warn('[notify] SMS skipped — configure TWILIO_* or MSG91_AUTH_KEY')
    return { ok: false, error: 'SMS provider not configured' }
  } catch (err: any) {
    console.error('[notify] SMS failed', err?.message)
    return { ok: false, error: err?.message || 'SMS failed' }
  }
}

export async function sendWhatsApp(to: string, body: string) {
  if (!to) return { ok: false, error: 'No phone' }
  try {
    if (process.env.TWILIO_ACCOUNT_SID && (process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_PHONE_NUMBER)) {
      return await twilioSend(to, body, 'whatsapp')
    }
    console.warn('[notify] WhatsApp skipped — configure TWILIO_ACCOUNT_SID + TWILIO_WHATSAPP_FROM')
    return { ok: false, error: 'WhatsApp provider not configured' }
  } catch (err: any) {
    console.error('[notify] WhatsApp failed', err?.message)
    return { ok: false, error: err?.message || 'WhatsApp failed' }
  }
}

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
    `🍕 New Lifepizza order #${order.orderNumber || ''}`,
    `Customer: ${order.userName || 'Guest'}${order.userPhone ? ` · ${order.userPhone}` : ''}`,
    `Pay: ${(order.payment?.method || 'cod').toUpperCase()} (${order.payment?.status || 'pending'})`,
    `Total: ₹${order.total ?? 0}`,
    lines ? `Items:\n${lines}` : '',
    addr ? `Address: ${addr}` : '',
  ].filter(Boolean).join('\n')
}

/** Fire-and-forget admin SMS + WhatsApp for a confirmed/placed order */
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
    await Promise.allSettled([
      sendSms(to, message.slice(0, 600)),
      sendWhatsApp(to, message),
    ])
  } catch (err: any) {
    console.error('[notify] admin alert failed', err?.message)
  }
}
