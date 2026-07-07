'use client'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { getDeliveryEstimate } from '@/lib/delivery'

export function StickyCartBar() {
  const items = useCart(s => s.items)
  const hydrated = useCart(s => s.hydrated)
  const totalItems = hydrated ? items.reduce((s, i) => s + i.qty, 0) : 0
  const totalPrice = hydrated ? items.reduce((s, i) => s + i.price * i.qty, 0) : 0

  if (!hydrated || totalItems === 0) return null

  const eta = getDeliveryEstimate(totalItems)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden pointer-events-none">
      <button
        onClick={() => document.dispatchEvent(new Event('open-cart'))}
        className="pointer-events-auto w-full max-w-lg mx-auto flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-green-600/30 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">View cart · ₹{totalPrice}</p>
            <p className="text-[10px] text-green-100">Delivery in {eta.label}</p>
          </div>
        </div>
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
