'use client'
import Image from 'next/image'
import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function Hero() {
  const [q, setQ] = useState('')

  const handleSearch = (val: string) => {
    setQ(val)
    document.dispatchEvent(new CustomEvent('menu-search', { detail: val }))
    if (val) {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden min-h-[300px] sm:min-h-[420px] md:min-h-[480px] flex items-center">
      <Image
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-950/90 via-green-900/80 to-emerald-800/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(74,222,128,0.15)_0%,_transparent_60%)]" />

      {/* Floating food emojis — Swiggy-style decorative touches */}
      <div className="absolute top-16 left-[8%] text-4xl opacity-20 animate-float hidden sm:block" style={{ animationDelay: '0s' }}>🍕</div>
      <div className="absolute top-24 right-[12%] text-3xl opacity-20 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>🍔</div>
      <div className="absolute bottom-20 left-[15%] text-3xl opacity-15 animate-float hidden md:block" style={{ animationDelay: '2s' }}>🍜</div>
      <div className="absolute bottom-16 right-[20%] text-4xl opacity-15 animate-float hidden md:block" style={{ animationDelay: '0.5s' }}>🥪</div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-10 sm:py-16 md:py-20 text-center animate-fade-up">
        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full tracking-wide mb-6">
          <Sparkles size={14} className="text-yellow-300" />
          4.8 rated · 2,000+ happy customers · Bhopal
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 sm:mb-4 leading-[1.1] tracking-tight">
          Hunger?{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
            CraveBox
          </span>
          <br className="hidden sm:block" />
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90"> delivers in 30 mins</span>
        </h1>

        <p className="text-green-100/90 text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto font-medium">
          Pizzas, burgers, sandwiches & maggi — hot, fresh, and at your door in <strong className="text-white">25–35 mins</strong>
        </p>

        <div className="relative max-w-xl mx-auto mb-8 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-30 group-focus-within:opacity-50 transition-opacity" />
          <div className="relative flex items-center bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <Search className="absolute left-5 text-green-500" size={22} />
            <input
              type="text"
              value={q}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search for pizza, burger, maggi…"
              className="w-full pl-14 pr-5 py-4 sm:py-5 bg-transparent text-gray-900 text-base font-medium placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          {[
            { icon: '🍕', label: 'Fresh daily' },
            { icon: '🛵', label: 'Free delivery ₹299+' },
            { icon: '⚡', label: '30-min delivery' },
            { icon: '💳', label: 'Secure pay' },
          ].map(b => (
            <span
              key={b.label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2"
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
