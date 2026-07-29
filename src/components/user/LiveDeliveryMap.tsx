'use client'
import { useEffect, useState } from 'react'
import { MapPin, Bike, Clock } from 'lucide-react'

const STATUS_COPY: Record<string, { title: string; hint: string; progress: number }> = {
  pending: { title: 'Order received', hint: 'Waiting for kitchen confirmation', progress: 15 },
  confirmed: { title: 'Order confirmed', hint: 'Kitchen has accepted your order', progress: 30 },
  preparing: { title: 'Preparing your food', hint: 'Being cooked fresh', progress: 55 },
  out_for_delivery: { title: 'Out for delivery', hint: 'Rider is on the way', progress: 80 },
  delivered: { title: 'Delivered', hint: 'Enjoy your meal!', progress: 100 },
}

export function LiveDeliveryMap({ status }: { status: string }) {
  const [progress, setProgress] = useState(15)
  const info = STATUS_COPY[status]

  useEffect(() => {
    if (!info) return
    setProgress(info.progress)
  }, [status, info])

  if (status === 'cancelled' || !info || status === 'delivered') return null

  return (
    <div className="card p-4 mb-6 overflow-hidden">
      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
        <MapPin size={16} className="text-green-600" /> Order progress
      </h3>
      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
        <Clock size={12} /> {info.hint}
      </p>
      <div className="relative h-3 bg-green-100 dark:bg-green-900/40 rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <p className="font-bold text-green-800 dark:text-green-300">{info.title}</p>
        {status === 'out_for_delivery' && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
            <Bike size={14} /> On the way
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Status updates when the kitchen advances your order. This is not a live GPS map.
      </p>
    </div>
  )
}
