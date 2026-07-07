'use client'
import { useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminOrderNotifier() {
  const lastCount = useRef<number | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/orders?status=pending&limit=1')
        const d = await res.json()
        if (!res.ok) return
        const pending = d.total ?? 0
        if (lastCount.current !== null && pending > lastCount.current) {
          toast('New order received!', { icon: '🔔', duration: 5000 })
          try {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 880
            gain.gain.value = 0.08
            osc.start()
            osc.stop(ctx.currentTime + 0.12)
          } catch { /* blocked */ }
        }
        lastCount.current = pending
      } catch { /* ignore */ }
    }
    check()
    const interval = setInterval(check, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden lg:flex items-center gap-2 bg-white border border-green-200 rounded-full px-4 py-2 shadow-lg text-xs font-semibold text-gray-500">
      <Bell size={14} className="text-green-500 animate-pulse" />
      Listening for orders
    </div>
  )
}
