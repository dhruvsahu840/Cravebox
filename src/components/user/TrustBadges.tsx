'use client'
import { Shield, Clock, Star, Truck } from 'lucide-react'

const BADGES = [
  { icon: Shield, label: 'Secure payments' },
  { icon: Clock, label: '30-min delivery' },
  { icon: Star, label: '4.8 rated' },
  { icon: Truck, label: 'Free delivery ₹299+' },
]

export function TrustBadges() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGES.map(b => (
          <div key={b.label} className="card p-3 flex items-center gap-2">
            <b.icon size={16} className="text-green-600 shrink-0" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
