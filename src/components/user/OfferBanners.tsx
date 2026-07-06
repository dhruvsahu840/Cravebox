'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Tag, Copy, Check } from 'lucide-react'

const OFFERS = [
  { code: 'WELCOME20', label: '20% off first order', desc: 'New users only · Max ₹100 off · Min order ₹199', color: 'from-green-500 to-emerald-600', emoji: '🎉' },
  { code: 'FLAT50',    label: '₹50 off on ₹299+',   desc: 'Valid on all orders · Limited time', color: 'from-orange-400 to-red-500', emoji: '🔥' },
  { code: 'PIZZA30',   label: '30% off on Pizzas',   desc: 'Use on any pizza order · Max ₹80 off', color: 'from-yellow-400 to-orange-500', emoji: '🍕' },
  { code: 'FREEMAGGI', label: '₹30 off on Maggi',    desc: 'Min order ₹99 · Maggi lovers special', color: 'from-purple-500 to-pink-500', emoji: '🍜' },
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
    <div className="bg-green-600 overflow-hidden py-2.5">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...MARQUEE, ...MARQUEE].map((item, i) => (
          <span key={i} className="text-white text-xs font-semibold mx-8">{item}</span>
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
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={18} className="text-green-600" />
        <h2 className="section-title mb-0">Today's offers</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OFFERS.map(offer => (
          <div key={offer.code} className="card overflow-hidden hover:shadow-md transition-shadow">
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
    </section>
  )
}
