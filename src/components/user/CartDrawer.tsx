'use client'
import { useEffect, useState } from 'react'
import { X, ShoppingCart, Plus, Minus, Trash2, MapPin, ChevronRight, Loader2, Tag, CheckCircle, Clock } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getDeliveryEstimate } from '@/lib/delivery'
import { EmptyState } from '@/components/shared/EmptyState'
import toast from 'react-hot-toast'

export function CartDrawer() {
  const [open, setOpen]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [payMethod, setPayMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [address, setAddress]     = useState({ line1: '', city: '', pincode: '' })
  const [couponCode, setCoupon]   = useState('')
  const [couponData, setCouponData] = useState<any>(null)
  const [applyingCoupon, setApplying] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const { data: session }         = useSession()
  const router                    = useRouter()
  const { items, updateQty, removeItem, clearCart, totalPrice, deliveryFee, tax } = useCart()

  useEffect(() => {
    const open = () => setOpen(true)
    document.addEventListener('open-cart', open)
    return () => document.removeEventListener('open-cart', open)
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/profile').then(r => r.json()).then(d => {
        if (d.user?.addresses?.length) {
          setSavedAddresses(d.user.addresses)
          const def = d.user.addresses.find((a: any) => a.isDefault) || d.user.addresses[0]
          if (def && !address.line1) setAddress({ line1: def.line1, city: def.city, pincode: def.pincode })
        }
      })
    }
  }, [session])

  const discount   = couponData?.discount || 0
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
    if (!session) { router.push('/auth/login'); return }
    if (!address.line1 || !address.city || !address.pincode) { toast.error('Fill in delivery address'); return }
    if (!items.length) { toast.error('Cart is empty'); return }
    setLoading(true)
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ product: i._id, qty: i.qty })),
          address, paymentMethod: payMethod,
          couponCode: couponData?.coupon?.code,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      if (payMethod === 'cod') {
        clearCart(); setOpen(false)
        toast.success('Order placed! 🎉')
        router.push(`/orders/${orderData.order._id}`)
        return
      }

      const rzpRes  = await fetch('/api/payments/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.order._id }),
      })
      const rzpData = await rzpRes.json()
      if (!rzpRes.ok) throw new Error(rzpData.error)

      const options = {
        key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:   rzpData.amount,
        currency: rzpData.currency,
        name:     'CraveBox',
        description: `Order #${orderData.order.orderNumber}`,
        order_id: rzpData.razorpayOrderId,
        prefill: { name: session.user.name, email: session.user.email },
        theme: { color: '#16a34a' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, orderId: orderData.order._id }),
          })
          if (verifyRes.ok) {
            clearCart(); setOpen(false)
            toast.success('Payment successful! 🎉')
            router.push(`/orders/${orderData.order._id}`)
          } else toast.error('Payment verification failed')
        },
      }
      ;(window as any).Razorpay(options).open()
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

      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 border-l border-green-100 dark:border-gray-800 z-50 flex flex-col transition-transform duration-300 shadow-2xl ${open ? 'translate-x-0' : 'translate-x-full'}`}>
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Items */}
          {items.length === 0 ? (
            <EmptyState emoji="🛒" title="Your cart is empty" description="Add something delicious from the menu" actionLabel="Browse menu" onAction={() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item._id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-11 h-11 bg-white rounded-xl border border-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {emojiFor(item.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-green-600 font-bold text-sm">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-7 h-7 bg-white border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-7 h-7 bg-white border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item._id)} className="w-7 h-7 ml-0.5 text-gray-300 hover:text-red-400 transition-colors flex items-center justify-center">
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

              {/* Payment */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['razorpay', 'cod'] as const).map(m => (
                    <button key={m} onClick={() => setPayMethod(m)}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${payMethod === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                      {m === 'razorpay' ? '💳 Online' : '💵 Cash'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-green-100 bg-green-50 space-y-3">
            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-700">₹{totalPrice()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={deliveryFee() === 0 ? 'text-green-600 font-semibold' : 'text-gray-700'}>{deliveryFee() === 0 ? 'FREE' : `₹${deliveryFee()}`}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span className="text-gray-700">₹{tax()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>−₹{discount}</span></div>}
            </div>
            <div className="flex justify-between font-black text-lg border-t border-green-200 pt-3 text-green-900">
              <span>Total</span><span className="text-green-600">₹{grandTotal}</span>
            </div>
            <button onClick={placeOrder} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
              {loading ? 'Processing…' : `Place Order · ₹${grandTotal}`}
            </button>
            {deliveryFee() > 0 && (
              <p className="text-center text-xs text-gray-400">Add ₹{299 - totalPrice()} more for free delivery</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
