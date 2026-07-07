'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Tag, Copy, Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const OFFERS = [
  { code: 'WELCOME20', label: '20% off first order', short: '20% off', desc: 'New users · Max ₹100 · Min ₹199', color: 'from-green-500 to-emerald-600', emoji: '🎉' },
  { code: 'FLAT50',    label: '₹50 off on ₹299+',   short: '₹50 off',  desc: 'All orders · Limited time', color: 'from-orange-400 to-red-500', emoji: '🔥' },
  { code: 'PIZZA30',   label: '30% off on Pizzas',   short: '30% pizza', desc: 'Any pizza · Max ₹80 off', color: 'from-yellow-400 to-orange-500', emoji: '🍕' },
  { code: 'FREEMAGGI', label: '₹30 off on Maggi',    short: '₹30 maggi', desc: 'Min ₹99 · Maggi special', color: 'from-purple-500 to-pink-500', emoji: '🍜' },
]

const MARQUEE = [
  '🎉 WELCOME20 — 20% off first order',
  '🛵 Free delivery above ₹299',
  '⚡ 30-min delivery guarantee',
  '🍕 PIZZA30 — 30% off all pizzas',
  '💳 Secure Razorpay payments',
  '⭐ 4.8 rated by 2,000+ customers',
]

export function OfferStrip() {
  return (
    <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 overflow-hidden py-2 relative z-20">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...MARQUEE, ...MARQUEE].map((item, i) => (
          <span key={i} className="text-white/95 text-[11px] sm:text-xs font-bold mx-6 sm:mx-8 tracking-wide">{item}</span>
        ))}
      </div>
    </div>
  )
}

export function OfferCards() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success(`Code "${code}" copied!`, { icon: '📋' })
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      {/* Mobile: compact header + horizontal scroll */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-green-600" />
            <h2 className="text-sm font-extrabold text-green-900">Offers</h2>
          </div>
          <Link href="/offers" className="text-xs font-bold text-green-600 flex items-center gap-0.5">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {OFFERS.map(offer => (
            <div
              key={offer.code}
              className="snap-start shrink-0 w-[168px] card overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${offer.color} px-3 py-2 text-white flex items-center gap-2`}>
                <span className="text-xl">{offer.emoji}</span>
                <p className="font-bold text-xs leading-tight">{offer.short}</p>
              </div>
              <div className="px-2.5 py-2 flex items-center gap-1.5">
                <code className="flex-1 bg-green-50 text-green-700 font-bold text-[10px] px-2 py-1 rounded-md text-center tracking-wide truncate">
                  {offer.code}
                </code>
                <button
                  onClick={() => copy(offer.code)}
                  className="w-7 h-7 shrink-0 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center transition-colors"
                  aria-label={`Copy ${offer.code}`}
                >
                  {copied === offer.code ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: full grid */}
      <div className="hidden md:block">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Tag size={16} className="text-green-600" />
          </div>
          <h2 className="section-title mb-0">Today&apos;s offers</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFERS.map(offer => (
            <div key={offer.code} className="card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`bg-gradient-to-r ${offer.color} p-4 text-white`}>
                <div className="text-3xl mb-2">{offer.emoji}</div>
                <p className="font-black text-lg leading-tight">{offer.label}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3">{offer.desc}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-green-50 border border-green-200 text-green-700 font-bold text-sm px-3 py-1.5 rounded-lg text-center tracking-wider">
                    {offer.code}
                  </code>
                  <button
                    onClick={() => copy(offer.code)}
                    className="w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    {copied === offer.code ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
