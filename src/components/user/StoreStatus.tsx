'use client'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function StoreStatus() {
  const [status, setStatus] = useState<{ open: boolean; label: string; sub: string } | null>(null)

  useEffect(() => {
    fetch('/api/store/status').then(r => r.json()).then(setStatus)
  }, [])

  if (!status) return null

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${status.open ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600'}`}>
      <span className={`w-2 h-2 rounded-full ${status.open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      {status.label} · <Clock size={11} /> {status.sub}
    </div>
  )
}
