'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Minus, Star, Loader2, Heart, Flame, Leaf } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { useWishlist } from '@/store/wishlistStore'
import { ProductDetailModal, MenuProduct } from '@/components/user/ProductDetailModal'
import { EmptyState } from '@/components/shared/EmptyState'
import Image from 'next/image'
import toast from 'react-hot-toast'

const EMOJI: Record<string, string> = {
  pizza: '🍕', burger: '🍔', sandwich: '🥪', maggi: '🍜', drinks: '☕',
}

export function MenuSection() {
  const [products, setProducts]       = useState<MenuProduct[]>([])
  const [categories, setCategories]   = useState<any[]>([])
  const [activecat, setActiveCat]       = useState('all')
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [selectedProduct, setSelected] = useState<MenuProduct | null>(null)
  const [filterVeg, setFilterVeg] = useState(false)
  const [filterBest, setFilterBest] = useState(false)
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default')
  const { items, addItem, updateQty } = useCart()
  const { toggle: toggleWish, has: hasWish, hydrated: wishHydrated } = useWishlist()

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

  const getQty = (id: string) =>
    items.filter(i => i._id === id).reduce((s, i) => s + i.qty, 0)

  const handleAdd = (e: React.MouseEvent, product: MenuProduct) => {
    e.stopPropagation()
    const price = product.discountedPrice || product.price
    addItem({ _id: product._id, name: product.name, price, image: product.images?.[0] || '' })
    toast.success(`${product.name} added!`, { icon: '🛒' })
  }

  const handleDecrease = (e: React.MouseEvent, product: MenuProduct) => {
    e.stopPropagation()
    const cartItem = items.find(i => i._id === product._id)
    if (cartItem) updateQty(product._id, cartItem.qty - 1, cartItem.customizations)
  }

  const catEmoji = (name: string) => EMOJI[name.toLowerCase()] || '🍽️'

  const displayed = products
    .filter(p => !filterVeg || p.isVeg)
    .filter(p => !filterBest || p.isBestseller)
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.discountedPrice || a.price) - (b.discountedPrice || b.price)
      if (sortBy === 'price-high') return (b.discountedPrice || b.price) - (a.discountedPrice || a.price)
      if (sortBy === 'rating') return (b.ratings?.avg ?? 0) - (a.ratings?.avg ?? 0)
      return 0
    })

  return (
    <>
      <section id="menu" className="max-w-6xl mx-auto px-4 py-5 md:py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">🍽️</div>
          <h2 className="section-title mb-0">Explore menu</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <button onClick={() => setActiveCat('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${activecat === 'all' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent shadow-green-600/25' : 'bg-white/80 backdrop-blur-sm text-gray-600 border-green-200/80 hover:bg-white hover:border-green-400'}`}>
            🍽️ All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setActiveCat(cat._id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${activecat === cat._id ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent shadow-green-600/25' : 'bg-white/80 backdrop-blur-sm text-gray-600 border-green-200/80 hover:bg-white hover:border-green-400'}`}>
              {catEmoji(cat.name)} {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilterVeg(!filterVeg)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterVeg ? 'bg-green-600 text-white border-green-600' : 'bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-green-200 dark:border-gray-700'}`}>
            <Leaf size={12} /> Veg only
          </button>
          <button onClick={() => setFilterBest(!filterBest)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterBest ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-green-200 dark:border-gray-700'}`}>
            <Flame size={12} /> Bestseller
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-green-50" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState emoji="🔍" title="Nothing found" description="Try a different search or filter" actionLabel="Clear filters" onAction={() => { setSearch(''); setFilterVeg(false); setFilterBest(false); setActiveCat('all') }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayed.map(product => {
              const qty   = getQty(product._id)
              const price = product.discountedPrice || product.price
              return (
                <div
                  key={product._id}
                  className="card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(product)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelected(product)}
                    className="cursor-pointer active:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                  >
                    <div className="relative h-44 bg-green-50 pointer-events-none">
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
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggleWish({ _id: product._id, name: product.name, price, image: product.images?.[0] || '' }) }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm pointer-events-auto z-10"
                      >
                        <Heart size={14} className={wishHydrated && hasWish(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                      </button>
                    </div>
                    <div className="p-4 pb-2 pointer-events-none">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-500 text-xs mb-2 line-clamp-2">{product.description}</p>
                      {(product.ratings?.count ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-500 font-medium">{(product.ratings?.avg ?? 0).toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({product.ratings?.count})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-green-600 font-black text-lg">₹{price}</span>
                        {product.discountedPrice && (
                          <span className="text-gray-400 text-xs line-through ml-1.5">₹{product.price}</span>
                        )}
                      </div>
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={e => handleAdd(e, product)}
                          className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1 shadow-sm"
                        >
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={e => handleDecrease(e, product)}
                            className="w-6 h-6 rounded-lg bg-white border border-green-200 flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold w-5 text-center text-green-800">{qty}</span>
                          <button
                            type="button"
                            onClick={e => handleAdd(e, product)}
                            className="w-6 h-6 rounded-lg bg-white border border-green-200 flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
