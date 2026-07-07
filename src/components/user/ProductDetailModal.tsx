'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Star, Plus, Minus, ShoppingCart, Zap } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/store/cartStore'
import toast from 'react-hot-toast'
import { ReviewsList } from '@/components/user/Reviews'

export interface MenuProduct {
  _id: string
  name: string
  description: string
  price: number
  discountedPrice?: number
  images: string[]
  isVeg: boolean
  isBestseller: boolean
  isSpicy: boolean
  ratings?: { avg: number; count: number }
  category?: { _id: string; name: string }
  tags?: string[]
  customizations?: {
    name: string
    options: { label: string; price: number }[]
  }[]
}

interface Props {
  product: MenuProduct | null
  onClose: () => void
}

const EMOJI = (name: string) =>
  name.toLowerCase().includes('pizza') ? '🍕' :
  name.toLowerCase().includes('burger') ? '🍔' :
  name.toLowerCase().includes('maggi') ? '🍜' :
  name.toLowerCase().includes('coffee') ? '☕' : '🥪'

function buildCustomizationKey(selections: Record<string, { label: string; price: number }>) {
  return Object.entries(selections)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}: ${v.label}`)
    .join(', ')
}

export function ProductDetailModal({ product, onClose }: Props) {
  const { items, addItem, updateQty } = useCart()
  const [qty, setQty] = useState(1)
  const [selections, setSelections] = useState<Record<string, { label: string; price: number }>>({})
  const [activeImage, setActiveImage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [imgError, setImgError] = useState(false)

  const customizationKey = buildCustomizationKey(selections)
  const cartItem = product
    ? items.find(i => i._id === product._id && (i.customizations || '') === customizationKey)
    : undefined

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!product) return
    setSelections({})
    setActiveImage(0)
    setImgError(false)
    setQty(1)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [product?._id])

  useEffect(() => {
    if (cartItem) setQty(cartItem.qty)
    else setQty(1)
  }, [cartItem?.qty, customizationKey, product?._id])

  if (!mounted || !product) return null

  const basePrice = product.discountedPrice || product.price
  const extras = Object.values(selections).reduce((s, o) => s + o.price, 0)
  const unitPrice = basePrice + extras
  const lineTotal = unitPrice * qty
  const discount = product.discountedPrice ? product.price - product.discountedPrice : 0
  const ratingCount = product.ratings?.count ?? 0
  const ratingAvg = product.ratings?.avg ?? 0

  const saveToCart = () => {
    const payload = {
      _id: product._id,
      name: product.name,
      price: unitPrice,
      image: product.images?.[0] || '',
      customizations: customizationKey || undefined,
    }

    if (cartItem) {
      updateQty(product._id, qty, customizationKey)
    } else {
      addItem(payload, qty)
    }
  }

  const handleAddToCart = () => {
    saveToCart()
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
    onClose()
  }

  const handleBuyNow = () => {
    saveToCart()
    onClose()
    document.dispatchEvent(new CustomEvent('open-cart'))
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white w-full sm:max-w-lg sm:mx-4 max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-52 sm:h-60 bg-green-50 shrink-0">
          {product.images?.[activeImage] && !imgError ? (
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">{EMOJI(product.name)}</div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} className="text-gray-600" />
          </button>

          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
            {product.isVeg && (
              <span className="bg-white/90 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-300">🟢 Veg</span>
            )}
            {product.isBestseller && (
              <span className="bg-white/90 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">🔥 Bestseller</span>
            )}
            {product.isSpicy && (
              <span className="bg-white/90 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">🌶️ Spicy</span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setActiveImage(i); setImgError(false) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-5' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            {product.category?.name && (
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">{product.category.name}</p>
            )}
            <h2 className="text-xl font-black text-gray-900">{product.name}</h2>
            {ratingCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-gray-700">{ratingAvg.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-400">({ratingCount} reviews)</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {product.customizations?.map(group => (
            <div key={group.name}>
              <p className="text-sm font-semibold text-gray-700 mb-2">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map(opt => {
                  const selected = selections[group.name]?.label === opt.label
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelections(s => ({ ...s, [group.name]: opt }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selected
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-green-300'
                      }`}
                    >
                      {opt.label}
                      {opt.price > 0 && <span className="text-gray-400 ml-1">+₹{opt.price}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
            <div>
              <span className="text-2xl font-black text-green-600">₹{unitPrice}</span>
              {product.discountedPrice && (
                <span className="text-gray-400 text-sm line-through ml-2">₹{product.price}</span>
              )}
              {discount > 0 && (
                <span className="ml-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  Save ₹{discount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 bg-white border border-green-200 rounded-xl px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors text-green-700"
              >
                <Minus size={16} />
              </button>
              <span className="font-black text-lg w-6 text-center text-green-800">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(q => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors text-green-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">Customer reviews</h3>
            <ReviewsList productId={product._id} />
          </div>
        </div>

        <div className="p-4 border-t border-green-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-secondary flex items-center justify-center gap-2 py-3.5 text-sm sm:text-base"
            >
              <ShoppingCart size={18} />
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="btn-primary flex items-center justify-center gap-2 py-3.5 text-sm sm:text-base"
            >
              <Zap size={18} />
              Buy now · ₹{lineTotal}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
