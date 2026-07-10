'use client'
import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

export function FlashDealBanner() {
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const tick = () => setSecs(Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-yellow-200" />
          <div>
            <p className="font-black text-sm">Flash deal — 20% off combos</p>
            <p className="text-xs text-orange-100">Use code <strong>FLASH20</strong> at checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono font-bold text-lg">
          <span className="bg-black/20 px-2 py-1 rounded">{pad(h)}</span>:
          <span className="bg-black/20 px-2 py-1 rounded">{pad(m)}</span>:
          <span className="bg-black/20 px-2 py-1 rounded">{pad(s)}</span>
        </div>
      </div>
    </div>
  )
}
