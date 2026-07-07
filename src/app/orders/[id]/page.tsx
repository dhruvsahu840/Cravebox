'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, Clock, ChefHat, Bike, Package, XCircle, RefreshCw, Star } from 'lucide-react'
import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { ReviewForm } from '@/components/user/Reviews'
import Link from 'next/link'

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order placed',      icon: Package },
  { key: 'confirmed',        label: 'Confirmed',         icon: CheckCircle },
  { key: 'preparing',        label: 'Being prepared',    icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for delivery',  icon: Bike },
  { key: 'delivered',        label: 'Delivered!',        icon: CheckCircle },
]

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviewedItems, setReviewedItems] = useState<string[]>([])

  const fetchOrder = async () => {
    const res  = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    if (res.ok) setOrder(data.order)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) return (
    <div className="page-shell min-h-screen"><PageBackground /><Navbar />
      <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin text-green-500" size={32}/></div>
    </div>
  )

  if (!order) return (
    <div className="page-shell min-h-screen"><PageBackground /><Navbar />
      <div className="text-center py-20 text-gray-400">Order not found.</div>
    </div>
  )

  const isCancelled  = order.status === 'cancelled'
  const currentStep  = STATUS_STEPS.findIndex(s => s.key === order.status)
  const estimatedMin = order.estimatedDelivery
    ? Math.max(0, Math.round((new Date(order.estimatedDelivery).getTime() - Date.now()) / 60000))
    : null

  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-xl font-black text-green-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-400 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              isCancelled ? 'badge-cancelled' : order.status === 'delivered' ? 'badge-delivered' : 'badge-preparing'
            }`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          {!isCancelled && order.status !== 'delivered' && estimatedMin !== null && (
            <div className="flex items-center gap-2 text-green-600 mt-3 font-semibold">
              <Clock size={16}/> Estimated delivery: ~{estimatedMin} min
            </div>
          )}
        </div>

        {!isCancelled ? (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 dark:text-gray-300">Live tracking</h2>
              {estimatedMin !== null && order.status !== 'delivered' && (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">ETA: ~{estimatedMin} min</span>
              )}
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-700" style={{ width: `${Math.max(10, ((currentStep + 1) / STATUS_STEPS.length) * 100)}%` }} />
            </div>
            <div className="space-y-5">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStep, active = idx === currentStep, Icon = step.icon
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-50 dark:bg-green-900/40 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'}`}>
                      <Icon size={18} className={done ? 'text-green-600' : 'text-gray-300'}/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${done ? 'text-gray-900 dark:text-white' : 'text-gray-300'}`}>{step.label}</p>
                      {active && <p className="text-xs text-green-600 mt-0.5 animate-pulse">● In progress</p>}
                    </div>
                    {done && !active && <CheckCircle size={18} className="text-green-500"/>}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="card p-6 mb-6 border-red-200">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle size={24}/>
              <div>
                <p className="font-bold">Order cancelled</p>
                <p className="text-sm text-gray-400">If you were charged, a refund will be processed in 5–7 days.</p>
              </div>
            </div>
          </div>
        )}

        {order.deliveryAgent?.name && order.status === 'out_for_delivery' && (
          <div className="card p-5 mb-6">
            <h3 className="font-bold mb-3 text-gray-700">Your delivery partner</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-xl">🛵</div>
              <div>
                <p className="font-bold text-gray-900">{order.deliveryAgent.name}</p>
                <a href={`tel:${order.deliveryAgent.phone}`} className="text-green-600 text-sm hover:underline">{order.deliveryAgent.phone}</a>
              </div>
            </div>
          </div>
        )}

        <div className="card p-6 mb-6">
          <h3 className="font-bold mb-4 text-gray-700">Your items</h3>
          <div className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{item.qty}× {item.name}</span>
                  <span className="text-gray-500 font-medium">₹{item.price * item.qty}</span>
                </div>
                {order.status === 'delivered' && !reviewedItems.includes(item.product) && (
                  <div className="mt-3">
                    <ReviewForm productId={item.product} orderId={order._id} onSubmit={() => setReviewedItems(r => [...r, item.product])} />
                  </div>
                )}
                {reviewedItems.includes(item.product) && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-2"><Star size={12} className="fill-green-600"/> Thanks for your review!</p>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-green-100 mt-4 pt-4 space-y-1 text-sm text-gray-500">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{order.tax}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{order.discount}</span></div>}
            <div className="flex justify-between font-black text-base text-green-900 mt-2 pt-2 border-t border-green-100">
              <span>Total</span><span className="text-green-600">₹{order.total}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="btn-primary flex-1 text-center">Order more</Link>
          <Link href="/orders" className="btn-secondary flex-1 text-center">All orders</Link>
        </div>
      </div>
    </div>
  )
}
