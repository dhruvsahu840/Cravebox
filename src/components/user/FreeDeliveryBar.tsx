'use client'
import { useSettings } from '@/store/settingsStore'

export function FreeDeliveryBar({ subtotal }: { subtotal: number }) {
  const freeDeliveryMin = useSettings(s => s.settings.freeDeliveryMin)

  const remaining = Math.max(0, freeDeliveryMin - subtotal)
  const progress = freeDeliveryMin > 0 ? Math.min(100, (subtotal / freeDeliveryMin) * 100) : 100

  if (subtotal >= freeDeliveryMin) {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-center">
        <p className="text-sm font-bold text-green-700 dark:text-green-300">You unlocked FREE delivery!</p>
      </div>
    )
  }

  return (
    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
      <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2">
        Add ₹{remaining} more for <strong>free delivery</strong>
      </p>
      <div className="w-full bg-orange-100 dark:bg-orange-900/40 rounded-full h-2">
        <div className="bg-gradient-to-r from-orange-400 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
