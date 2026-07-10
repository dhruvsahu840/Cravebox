'use client'
import { useEffect, useState } from 'react'
import { Flame, Plus } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import Image from 'next/image'
import toast from 'react-hot-toast'

export function TrendingSection() {
  const [products, setProducts] = useState<any[]>([])
  const addItem = useCart(s => s.addItem)

  useEffect(() => {
    fetch('/api/products/trending').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])

  if (!products.length) return null

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={20} className="text-orange-500" />
        <h2 className="section-title mb-0">Trending now</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {products.map(p => (
          <div key={p._id} className="card shrink-0 w-44 overflow-hidden">
            <div className="relative h-28 bg-green-50">
              {p.images?.[0] ? (
                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
              )}
            </div>
            <div className="p-3">
              <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-green-600 font-black">₹{p.discountedPrice || p.price}</span>
                <button
                  onClick={() => { addItem({ _id: p._id, name: p.name, price: p.discountedPrice || p.price, image: p.images?.[0] || '' }); toast.success('Added!') }}
                  className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
