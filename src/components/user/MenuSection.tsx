'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Minus, Star, Loader2 } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Product {
  _id: string; name: string; description: string; price: number
  discountedPrice?: number; images: string[]; isVeg: boolean
  isBestseller: boolean; isSpicy: boolean; ratings: { avg: number; count: number }
  category: { _id: string; name: string }
}

const EMOJI: Record<string, string> = {
  pizza: '🍕', burger: '🍔', sandwich: '🥪', maggi: '🍜', drinks: '☕',
}

export function MenuSection() {
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activecat, setActiveCat]   = useState('all')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const { items, addItem, updateQty } = useCart()

  // Listen for hero search
  useEffect(() => {
    const handler = (e: any) => setSearch(e.detail)
    document.addEventListener('menu-search', handler)
    return () => document.removeEventListener('menu-search', handler)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [prodRes, catRes] = await Promise.all([
      fetch(`/api/products?limit=40${activecat !== 'all' ? `&category=${activecat}` : ''}${search ? `&search=${search}` : ''}`),
      fetch('/api/categories'),
    ])
    const pd = await prodRes.json()
    const cd = await catRes.json()
    setProducts(pd.products || [])
    setCategories(cd.categories || [])
    setLoading(false)
  }, [activecat, search])

  useEffect(() => { fetchData() }, [fetchData])

  const getQty = (id: string) => items.find(i => i._id === id)?.qty || 0

  const handleAdd = (product: Product) => {
    const price = product.discountedPrice || product.price
    addItem({ _id: product._id, name: product.name, price, image: product.images?.[0] || '' })
    toast.success(`${product.name} added!`, { icon: '🛒' })
  }

  const catEmoji = (name: string) => EMOJI[name.toLowerCase()] || '🍽️'

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        <button onClick={() => setActiveCat('all')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${activecat === 'all' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-green-200 hover:bg-green-50 hover:border-green-400'}`}>
          🍽️ All
        </button>
        {categories.map(cat => (
          <button key={cat._id} onClick={() => setActiveCat(cat._id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${activecat === cat._id ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-green-200 hover:bg-green-50 hover:border-green-400'}`}>
            {catEmoji(cat.name)} {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-green-50" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🤷</div>
          <p className="font-medium">Nothing found — try a different search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => {
            const qty   = getQty(product._id)
            const price = product.discountedPrice || product.price
            return (
              <div key={product._id} className="card overflow-hidden hover:shadow-md hover:border-green-300 transition-all group cursor-pointer">
                <div className="relative h-44 bg-green-50">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {product.name.toLowerCase().includes('pizza') ? '🍕' :
                       product.name.toLowerCase().includes('burger') ? '🍔' :
                       product.name.toLowerCase().includes('maggi') ? '🍜' :
                       product.name.toLowerCase().includes('coffee') ? '☕' : '🥪'}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {product.isVeg && (
                      <span className="bg-white/90 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-300">🟢 Veg</span>
                    )}
                    {product.isBestseller && (
                      <span className="bg-white/90 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">🔥 Best</span>
                    )}
                    {product.isSpicy && (
                      <span className="bg-white/90 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">🌶️ Spicy</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">{product.description}</p>
                  {product.ratings.count > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-500 font-medium">{product.ratings.avg.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({product.ratings.count})</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-green-600 font-black text-lg">₹{price}</span>
                      {product.discountedPrice && (
                        <span className="text-gray-400 text-xs line-through ml-1.5">₹{product.price}</span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button onClick={() => handleAdd(product)}
                        className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1 shadow-sm">
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-2 py-1">
                        <button onClick={() => updateQty(product._id, qty - 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-green-200 flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="font-bold w-5 text-center text-green-800">{qty}</span>
                        <button onClick={() => handleAdd(product)}
                          className="w-6 h-6 rounded-lg bg-white border border-green-200 flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
