'use client'
import Image from 'next/image'
import { Search, Sparkles } from 'lucide-react'

export function Hero() {
  const focusSearch = () => {
    document.dispatchEvent(new Event('focus-menu-search'))
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
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
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 sm:py-14 md:py-16 text-center animate-fade-up">
        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full tracking-wide mb-4 sm:mb-6">
          <Sparkles size={14} className="text-yellow-300" />
          4.8 rated · 2,000+ happy customers · bijawar
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 sm:mb-4 leading-[1.15] tracking-tight">
          Hunger?{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
            Lifepizza
          </span>
          <span className="block sm:inline text-2xl sm:text-4xl md:text-5xl font-bold text-white/90 sm:ml-2">
            delivers in 30 mins
          </span>
        </h1>

        <p className="text-green-100/90 text-sm sm:text-lg mb-5 sm:mb-8 max-w-lg mx-auto font-medium px-1">
          Pizzas, burgers, sandwiches & maggi — hot and at your door in{' '}
          <strong className="text-white">25–35 mins</strong>
        </p>

        <button
          type="button"
          onClick={focusSearch}
          className="mx-auto mb-5 sm:mb-8 flex w-full max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-xl shadow-black/15 active:scale-[0.99] transition-transform"
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Search size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-gray-900">Find your craving</span>
            <span className="block truncate text-xs text-gray-400">Search pizza, burger, maggi…</span>
          </span>
        </button>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          {[
            { icon: '🍕', label: 'Fresh daily' },
            { icon: '🛵', label: 'Free delivery ₹299+' },
            { icon: '⚡', label: '30-min delivery' },
            { icon: '💳', label: 'Secure pay' },
          ].map(b => (
            <span
              key={b.label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5"
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
