'use client'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function Hero() {
  const [q, setQ] = useState('')

  const handleSearch = (val: string) => {
    setQ(val)
    document.dispatchEvent(new CustomEvent('menu-search', { detail: val }))
  }

  return (
    <section className="bg-gradient-to-b from-green-50 to-white border-b border-green-100 py-14 px-4 text-center">
      <span className="inline-block bg-green-100 border border-green-200 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide mb-5">
        ⭐ 4.8 rated · 2,000+ happy customers
      </span>
      <h1 className="text-4xl md:text-5xl font-black text-green-900 mb-3 leading-tight">
        Fresh food,{' '}
        <span className="text-green-600">fast delivery</span>
      </h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
        Pizzas, Burgers, Sandwiches & Maggi — made fresh, delivered in 30 mins
      </p>

      <div className="relative max-w-lg mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" size={20}/>
        <input
          type="text"
          value={q}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search pizza, burger, maggi…"
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none bg-white text-gray-900 text-base shadow-sm transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { icon: '🍕', label: 'Fresh daily' },
          { icon: '🛵', label: 'Free delivery ₹299+' },
          { icon: '📦', label: 'Live tracking' },
          { icon: '💳', label: 'Secure payments' },
        ].map(b => (
          <span key={b.label} className="bg-white border border-green-200 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            {b.icon} {b.label}
          </span>
        ))}
      </div>
    </section>
  )
}
