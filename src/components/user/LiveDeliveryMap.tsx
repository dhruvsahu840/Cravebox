'use client'
import { useEffect, useState } from 'react'
import { MapPin, Bike } from 'lucide-react'

export function LiveDeliveryMap({ status }: { status: string }) {
  const [progress, setProgress] = useState(20)

  useEffect(() => {
    if (status === 'out_for_delivery') {
      const id = setInterval(() => setProgress(p => Math.min(95, p + 2)), 3000)
      return () => clearInterval(id)
    }
    if (status === 'delivered') setProgress(100)
    else if (status === 'preparing') setProgress(40)
    else if (status === 'confirmed') setProgress(25)
  }, [status])

  if (status === 'cancelled' || status === 'delivered') return null

  return (
    <div className="card p-4 mb-6 overflow-hidden">
      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <MapPin size={16} className="text-green-600" /> Live delivery map
      </h3>
      <div className="relative h-40 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #16a34a 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #16a34a 0px, transparent 1px, transparent 20px)' }} />
        <div className="absolute left-4 bottom-4 w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow" title="Restaurant" />
        <div className="absolute right-4 top-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow" title="Your location" />
        <div
          className="absolute transition-all duration-1000 ease-linear"
          style={{ left: `${progress}%`, top: `${100 - progress * 0.8}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 animate-pulse">
            <Bike size={16} className="text-white" />
          </div>
        </div>
      </div>
      {status === 'out_for_delivery' && (
        <p className="text-xs text-green-600 mt-2 text-center font-semibold animate-pulse">Rider is on the way to you</p>
      )}
    </div>
  )
}
