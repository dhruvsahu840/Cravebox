import { connectDB } from '@/lib/db'
import { StoreSettings } from '@/models'
import { STORE } from '@/lib/config'

export type StoreSettingsData = {
  taxRate: number
  deliveryFee: number
  freeDeliveryMin: number
  minOrder: number
  phone: string
  whatsapp: string
  adminNotifyPhone: string
  city: string
  openHour: number
  closeHour: number
}

const DEFAULTS: StoreSettingsData = {
  taxRate: STORE.taxRate,
  deliveryFee: STORE.deliveryFee,
  freeDeliveryMin: STORE.freeDeliveryMin,
  minOrder: STORE.minOrder,
  phone: STORE.phone,
  whatsapp: STORE.whatsapp,
  adminNotifyPhone: STORE.whatsapp,
  city: STORE.city,
  openHour: STORE.openHour,
  closeHour: STORE.closeHour,
}

const SETTINGS_KEY = 'store'

function digitsOnly(v: string) {
  return String(v || '').replace(/\D/g, '')
}

function toSettings(
  doc: Record<string, unknown> | null
): StoreSettingsData {
  if (!doc) return { ...DEFAULTS }

  const phone = String(doc.phone || DEFAULTS.phone)

  const whatsapp = digitsOnly(
    String(doc.whatsapp || phone || DEFAULTS.whatsapp)
  )

  const adminNotifyPhone = digitsOnly(
    String(
      doc.adminNotifyPhone ||
        whatsapp ||
        DEFAULTS.adminNotifyPhone
    )
  )

  return {
    taxRate: (doc.taxRate as number) ?? DEFAULTS.taxRate,
    deliveryFee: (doc.deliveryFee as number) ?? DEFAULTS.deliveryFee,
    freeDeliveryMin:
      (doc.freeDeliveryMin as number) ?? DEFAULTS.freeDeliveryMin,
    minOrder: (doc.minOrder as number) ?? DEFAULTS.minOrder,
    phone,
    whatsapp,
    adminNotifyPhone,
    city: String(doc.city || DEFAULTS.city),
    openHour: Number(doc.openHour ?? DEFAULTS.openHour),
    closeHour: Number(doc.closeHour ?? DEFAULTS.closeHour),
  }
}

export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    await connectDB()

    let doc = await StoreSettings.findOne({
      key: SETTINGS_KEY,
    }).lean()

    if (!doc) {
      doc = await StoreSettings.findOneAndUpdate(
        { key: SETTINGS_KEY },
        {
          key: SETTINGS_KEY,
          ...DEFAULTS,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      ).lean()
    }

    return toSettings(doc as Record<string, unknown>)
  } catch (error) {
    console.error('Failed to get store settings:', error)

    return { ...DEFAULTS }
  }
}

export async function updateStoreSettings(
  data: Partial<StoreSettingsData>
): Promise<StoreSettingsData> {
  await connectDB()

  const update: Partial<StoreSettingsData> = {}

  if (data.taxRate !== undefined) {
    update.taxRate = Math.min(0.3, Math.max(0, data.taxRate))
  }

  if (data.deliveryFee !== undefined) {
    update.deliveryFee = Math.min(500, Math.max(0, data.deliveryFee))
  }

  if (data.freeDeliveryMin !== undefined) {
    update.freeDeliveryMin = Math.max(0, data.freeDeliveryMin)
  }

  if (data.minOrder !== undefined) {
    update.minOrder = Math.max(0, data.minOrder)
  }

  if (data.phone !== undefined) {
    update.phone = String(data.phone).trim()
  }

  if (data.whatsapp !== undefined) {
    update.whatsapp = digitsOnly(data.whatsapp)
  }

  if (data.adminNotifyPhone !== undefined) {
    update.adminNotifyPhone = digitsOnly(data.adminNotifyPhone)
  }

  if (data.city !== undefined) {
    update.city =
      String(data.city).trim() || DEFAULTS.city
  }

  if (data.openHour !== undefined) {
    update.openHour = Math.min(
      23,
      Math.max(0, Math.round(data.openHour))
    )
  }

  if (data.closeHour !== undefined) {
    update.closeHour = Math.min(
      24,
      Math.max(1, Math.round(data.closeHour))
    )
  }

  const doc = await StoreSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      key: SETTINGS_KEY,
      ...DEFAULTS,
      ...update,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).lean()

  return toSettings(doc as Record<string, unknown>)
}

/* ================================
   INDIA TIMEZONE
   ================================ */

export function getIndiaHour(): number {
  return Number(
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      hour12: false,
    }).format(new Date())
  )
}

/* ================================
   DELIVERY FEE
   ================================ */

export function calcDeliveryFee(
  subtotal: number,
  settings: StoreSettingsData
): number {
  return subtotal >= settings.freeDeliveryMin
    ? 0
    : settings.deliveryFee
}

/* ================================
   TAX
   ================================ */

export function calcTax(
  subtotal: number,
  settings: StoreSettingsData
): number {
  return Math.round(subtotal * settings.taxRate)
}

/* ================================
   STORE OPEN/CLOSE CHECK
   ================================ */

export function isStoreOpenNow(
  settings: Pick<
    StoreSettingsData,
    'openHour' | 'closeHour'
  >
): boolean {
  const h = getIndiaHour()

  // Same opening and closing hour = open 24 hours
  if (settings.openHour === settings.closeHour) {
    return true
  }

  // Normal opening hours
  // Example: 10 → 23
  if (settings.openHour < settings.closeHour) {
    return (
      h >= settings.openHour &&
      h < settings.closeHour
    )
  }

  // Overnight opening hours
  // Example: 22 → 2
  return (
    h >= settings.openHour ||
    h < settings.closeHour
  )
}

/* ================================
   STORE STATUS
   ================================ */

export function storeStatusFromSettings(
  settings: StoreSettingsData
) {
  const open = isStoreOpenNow(settings)

  if (open) {
    return {
      open: true,
      label: 'Open now',
      sub: `Closes at ${settings.closeHour}:00`,
    }
  }

  const h = getIndiaHour()

  if (h < settings.openHour) {
    return {
      open: false,
      label: 'Closed',
      sub: `Opens at ${settings.openHour}:00`,
    }
  }

  return {
    open: false,
    label: 'Closed',
    sub: `Opens tomorrow at ${settings.openHour}:00`,
  }
}