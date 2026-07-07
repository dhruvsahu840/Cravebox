import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  dark: boolean
  toggle: () => void
  setDark: (v: boolean) => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => set({ dark: !get().dark }),
      setDark: (v) => set({ dark: v }),
    }),
    { name: 'cravebox-theme' }
  )
)
