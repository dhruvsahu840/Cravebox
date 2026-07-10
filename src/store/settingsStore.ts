import { create } from 'zustand'
import { STORE } from '@/lib/config'

export type Settings = {
  taxRate: number
  deliveryFee: number
  freeDeliveryMin: number
  minOrder: number
}

interface SettingsStore {
  settings: Settings
  loaded: boolean
  fetchSettings: () => Promise<void>
  setSettings: (s: Settings) => void
}

const defaults: Settings = {
  taxRate: STORE.taxRate,
  deliveryFee: STORE.deliveryFee,
  freeDeliveryMin: STORE.freeDeliveryMin,
  minOrder: STORE.minOrder,
}

export const useSettings = create<SettingsStore>((set) => ({
  settings: defaults,
  loaded: false,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/store/settings')
      const data = await res.json()
      if (res.ok && data.settings) {
        set({ settings: data.settings, loaded: true })
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },
  setSettings: (s) => set({ settings: s, loaded: true }),
}))

export function getSettingsSnapshot(): Settings {
  return useSettings.getState().settings
}
