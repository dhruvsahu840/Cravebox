import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  qty: number
  customizations?: string
}

interface CartStore {
  items: CartItem[]

  // ⭐ ADDED
  hydrated: boolean
  setHydrated: (value: boolean) => void

  addItem:     (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeItem:  (id: string) => void
  updateQty:   (id: string, qty: number, customizations?: string) => void
  clearCart:   () => void
  totalItems:  () => number
  totalPrice:  () => number
  deliveryFee: () => number
  tax:         () => number
  grandTotal:  () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // ⭐ ADDED
      hydrated: false,

      // ⭐ ADDED
      setHydrated: (value) => set({ hydrated: value }),

      addItem: (item, qty = 1) => set((state) => {
        const key = item.customizations || ''
        const existing = state.items.find(i =>
          i._id === item._id && (i.customizations || '') === key
        )

        if (existing) {
          return {
            items: state.items.map(i =>
              i._id === item._id && (i.customizations || '') === key
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          }
        }

        return {
          items: [...state.items, { ...item, qty }],
        }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i._id !== id),
      })),

      updateQty: (id, qty, customizations) => set((state) => {
        const key = customizations || ''
        if (qty <= 0) {
          return {
            items: state.items.filter(i =>
              !(i._id === id && (i.customizations || '') === key)
            ),
          }
        }

        return {
          items: state.items.map(i =>
            i._id === id && (i.customizations || '') === key
              ? { ...i, qty }
              : i
          ),
        }
      }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      deliveryFee: () => get().totalPrice() >= 299 ? 0 : 40,
      tax: () => Math.round(get().totalPrice() * 0.05),
      grandTotal: () =>
        get().totalPrice() +
        get().deliveryFee() +
        get().tax(),
    }),
    {
      name: 'cravebox-cart',

      // ⭐ ADDED
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)