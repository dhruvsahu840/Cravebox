import { connectDB } from '@/lib/db'
import { StoreSettings } from '@/models'
import { STORE } from '@/lib/config'

export type StoreSettingsData = {
  taxRate: number
  deliveryFee: number
  freeDeliveryMin: number
  minOrder: number
}

const DEFAULTS: StoreSettingsData = {
  taxRate: STORE.taxRate,
  deliveryFee: STORE.deliveryFee,
  freeDeliveryMin: STORE.freeDeliveryMin,
  minOrder: STORE.minOrder,
}

const SETTINGS_KEY = 'store'

function toSettings(doc: Record<string, unknown> | null): StoreSettingsData {
  if (!doc) return DEFAULTS
  return {
    taxRate: (doc.taxRate as number) ?? DEFAULTS.taxRate,
    deliveryFee: (doc.deliveryFee as number) ?? DEFAULTS.deliveryFee,
    freeDeliveryMin: (doc.freeDeliveryMin as number) ?? DEFAULTS.freeDeliveryMin,
    minOrder: (doc.minOrder as number) ?? DEFAULTS.minOrder,
  }
}

export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    await connectDB()
    let doc = await StoreSettings.findOne({ key: SETTINGS_KEY }).lean()
    if (!doc) {
      doc = await StoreSettings.findOneAndUpdate(
        { key: SETTINGS_KEY },
        { key: SETTINGS_KEY, ...DEFAULTS },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean()
    }
    return toSettings(doc as Record<string, unknown>)
  } catch {
    return DEFAULTS
  }
}

export async function updateStoreSettings(data: Partial<StoreSettingsData>): Promise<StoreSettingsData> {
  await connectDB()
  const update: Partial<StoreSettingsData> = {}
  if (data.taxRate !== undefined) update.taxRate = Math.min(0.3, Math.max(0, data.taxRate))
  if (data.deliveryFee !== undefined) update.deliveryFee = Math.min(500, Math.max(0, data.deliveryFee))
  if (data.freeDeliveryMin !== undefined) update.freeDeliveryMin = Math.max(0, data.freeDeliveryMin)
  if (data.minOrder !== undefined) update.minOrder = Math.max(0, data.minOrder)

  const doc = await StoreSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { key: SETTINGS_KEY, ...DEFAULTS, ...update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()

  return toSettings(doc as Record<string, unknown>)
}

export function calcDeliveryFee(subtotal: number, settings: StoreSettingsData): number {
  return subtotal >= settings.freeDeliveryMin ? 0 : settings.deliveryFee
}

export function calcTax(subtotal: number, settings: StoreSettingsData): number {
  return Math.round(subtotal * settings.taxRate)
}
