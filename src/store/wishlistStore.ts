import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  _id: string
  name: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  hydrated: boolean
  setHydrated: (v: boolean) => void
  toggle: (item: WishlistItem) => void
  has: (id: string) => boolean
  remove: (id: string) => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      toggle: (item) => set((s) => {
        const exists = s.items.find(i => i._id === item._id)
        if (exists) return { items: s.items.filter(i => i._id !== item._id) }
        return { items: [...s.items, item] }
      }),
      has: (id) => get().items.some(i => i._id === id),
      remove: (id) => set(s => ({ items: s.items.filter(i => i._id !== id) })),
    }),
    {
      name: 'cravebox-wishlist',
      onRehydrateStorage: () => (s) => s?.setHydrated(true),
    }
  )
)
