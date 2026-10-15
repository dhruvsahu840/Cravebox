'use client'
import { useEffect, useState } from 'react'
import { X, ShoppingCart, Plus, Minus, Trash2, MapPin, ChevronRight, Loader2, Tag, CheckCircle, Clock, Truck } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getDeliveryEstimate } from '@/lib/delivery'
import { EmptyState } from '@/components/shared/EmptyState'
import { GuestCheckoutModal } from '@/components/user/GuestCheckoutModal'
import { STORE } from '@/lib/config'
import { useSettings } from '@/store/settingsStore'
import toast from 'react-hot-toast'

export function CartDrawer() {
  const [open, setOpen]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [address, setAddress]     = useState({ line1: '', city: '', pincode: '' })
  const [couponCode, setCoupon]   = useState('')
  const [couponData, setCouponData] = useState<any>(null)
  const [applyingCoupon, setApplying] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [guestOpen, setGuestOpen] = useState(false)
  const [scheduleLater, setScheduleLater] = useState(false)
  const [scheduledFor, setScheduledFor] = useState('')
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [useLoyalty, setUseLoyalty] = useState(false)
  const { data: session }         = useSession()
  const router                    = useRouter()
  const { items, updateQty, removeItem, clearCart, totalPrice, deliveryFee, tax } = useCart()
  const { taxRate, minOrder, freeDeliveryMin } = useSettings(s => s.settings)
  const fetchSettings = useSettings(s => s.fetchSettings)

  useEffect(() => {
    const openCart = () => {
      setOpen(true)
      fetchSettings()
    }

    document.addEventListener('open-cart', openCart)
    return () => document.removeEventListener('open-cart', openCart)
  }, [fetchSettings])

  // Lock the page behind the drawer while the cart is open.
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.user?.addresses?.length) {
        setSavedAddresses(d.user.addresses)
        const def = d.user.addresses.find((a: any) => a.isDefault) || d.user.addresses[0]
        if (def && !address.line1) setAddress({ line1: def.line1, city: def.city, pincode: def.pincode })
      }
      if (d.user?.loyaltyPoints) setLoyaltyPoints(d.user.loyaltyPoints)
    }).catch(() => {})
    fetch('/api/orders?limit=1').then(r => r.json()).then(d => {
      if ((d.total ?? d.orders?.length ?? 0) === 0 && !couponData) {
        setCoupon(STORE.firstOrderCoupon)
      }
    }).catch(() => {})
  }, [session?.user?.id])

  const discount   = (couponData?.discount || 0) + (useLoyalty ? Math.min(loyaltyPoints / 10, totalPrice() * 0.2) : 0)
  const grandTotal = totalPrice() + deliveryFee() + tax() - discount
  const eta = getDeliveryEstimate(items.reduce((s, i) => s + i.qty, 0))

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplying(true)
    const res  = await fetch('/api/coupons/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, cartTotal: totalPrice() }),
    })
    const data = await res.json()
    setApplying(false)
    if (res.ok) { setCouponData(data); toast.success(data.message, { icon: '🎉' }) }
    else         { toast.error(data.error); setCouponData(null) }
  }

  const removeCoupon = () => { setCouponData(null); setCoupon('') }

  const placeOrder = async () => {
    if (!session) { setGuestOpen(true); return }
    if (session.user.role !== 'admin' && !session.user.phoneVerified) {
      toast.error('Sign in with your phone number to place an order')
      setOpen(false)
      router.push('/auth/login?callbackUrl=/')
      return
    }
    if (!address.line1 || !address.city || !address.pincode) { toast.error('Fill in delivery address'); return }
    if (!items.length) { toast.error('Cart is empty'); return }
    if (totalPrice() < minOrder) { toast.error(`Minimum order is ₹${minOrder}`); return }
    setLoading(true)
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ product: i._id, qty: i.qty, customizations: i.customizations })),
          address, paymentMethod: 'cod',
          couponCode: couponData?.coupon?.code || (couponCode || undefined),
          scheduledFor: scheduleLater && scheduledFor ? scheduledFor : undefined,
          useLoyalty,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      clearCart()
      setOpen(false)
      toast.success('Order placed! 🎉')
      router.push(`/orders/${orderData.order._id}`)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const emojiFor = (name: string) =>
    name.toLowerCase().includes('pizza') ? '🍕' :
    name.toLowerCase().includes('burger') ? '🍔' :
    name.toLowerCase().includes('maggi') ? '🍜' :
    name.toLowerCase().includes('coffee') ? '☕' : '🥪'

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-green-100 bg-white shadow-2xl transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-green-100 dark:border-gray-800 bg-green-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold text-green-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-green-600" /> Your Order
            </h2>
            {items.length > 0 && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><Clock size={11} /> Delivery in {eta.label}</p>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 bg-white rounded-lg border border-green-200 flex items-center justify-center hover:bg-green-50 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {/* Items */}
          {items.length === 0 ? (
            <EmptyState emoji="🛒" title="Your cart is empty" description="Add something delicious from the menu" actionLabel="Browse menu" onAction={() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={`${item._id}-${item.customizations || ''}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-11 h-11 bg-white rounded-xl border border-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {emojiFor(item.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    {item.customizations && (
                      <p className="text-xs text-gray-500 truncate">{item.customizations}</p>
                    )}
                    <p className="text-green-600 font-bold text-sm">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-black">
                    <button onClick={() => updateQty(item._id, item.qty - 1, item.customizations)} className="w-7 h-7 bg-white border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1, item.customizations)} className="w-7 h-7 bg-white border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item._id, item.customizations)} className="w-7 h-7 ml-0.5 text-gray-300 hover:text-red-400 transition-colors flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* Coupon */}
              <div>
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-green-600" /> Coupon code
                </p>
                {couponData ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-green-700">{couponData.coupon.code} — ₹{couponData.discount} saved!</span>
                    <button onClick={removeCoupon} className="text-gray-400 hover:text-red-400"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input className="input text-sm py-2 flex-1" placeholder="Enter coupon code" value={couponCode}
                      onChange={e => setCoupon(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                    <button onClick={applyCoupon} disabled={applyingCoupon} className="btn-secondary text-sm px-4 py-2">
                      {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-green-600" /> Delivery address
                </p>
                {savedAddresses.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                    {savedAddresses.map((addr: any) => (
                      <button key={addr._id} onClick={() => setAddress({ line1: addr.line1, city: addr.city, pincode: addr.pincode })}
                        className={`shrink-0 text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${address.line1 === addr.line1 ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                        {addr.label}<br /><span className="font-normal text-[10px]">{addr.line1.slice(0, 20)}…</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <input className="input text-sm py-2.5" placeholder="Street / flat / building" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input text-sm py-2.5" placeholder="City" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />
                    <input className="input text-sm py-2.5" placeholder="Pincode" value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                  <input type="checkbox" checked={scheduleLater} onChange={e => setScheduleLater(e.target.checked)} className="rounded" />
                  Schedule for later
                </label>
                {scheduleLater && (
                  <input type="datetime-local" className="input text-sm py-2" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
                )}
              </div>

              {/* Cash on Delivery only */}
              <div className="rounded-xl border border-green-200 bg-green-50/70 p-3 dark:border-green-900 dark:bg-green-950/30">
                <p className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Payment method</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg shadow-sm dark:bg-gray-800">💵</span>
                  Cash on Delivery
                  <CheckCircle size={16} className="ml-auto" />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pay in cash when your order arrives.</p>
              </div>

              {loyaltyPoints >= 100 && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={useLoyalty} onChange={e => setUseLoyalty(e.target.checked)} />
                  <span className="text-gray-600 dark:text-gray-300">Use {Math.min(loyaltyPoints, 100)} loyalty points (−₹{Math.min(loyaltyPoints / 10, totalPrice() * 0.2).toFixed(0)})</span>
                </label>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 space-y-2.5 border-t border-green-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            {totalPrice() >= freeDeliveryMin ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                <Truck size={15} />
                You unlocked free delivery!
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1"><Truck size={13} /> Free delivery</span>
                  <span className="font-semibold">Add ₹{Math.max(0, freeDeliveryMin - totalPrice())} more</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${Math.min(100, freeDeliveryMin > 0 ? (totalPrice() / freeDeliveryMin) * 100 : 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-700">₹{totalPrice()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={deliveryFee() === 0 ? 'text-green-600 font-semibold' : 'text-gray-700'}>{deliveryFee() === 0 ? 'FREE' : `₹${deliveryFee()}`}</span></div>
              <div className="flex justify-between"><span>Tax ({Math.round(taxRate * 1000) / 10}%)</span><span className="text-gray-700">₹{tax()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>−₹{discount}</span></div>}
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-black text-gray-900 dark:border-gray-700 dark:text-white">
              <span>Total</span><span className="text-green-600">₹{grandTotal}</span>
            </div>
            <button onClick={placeOrder} disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
              {loading ? 'Processing…' : `Place Order · ₹${grandTotal}`}
            </button>
          </div>
        )}
      </div>
      <GuestCheckoutModal open={guestOpen} onClose={() => setGuestOpen(false)} onSuccess={() => placeOrder()} />
    </>
  )
}
