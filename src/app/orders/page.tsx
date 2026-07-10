'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChefHat, Bike, CheckCircle, XCircle, ChevronRight, Loader2, RotateCcw } from 'lucide-react'
import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCart } from '@/store/cartStore'
import toast from 'react-hot-toast'

const STATUS_META: Record<string, { label: string; icon: any; color: string }> = {
  pending:          { label: 'Order placed',    icon: Package,     color: 'text-yellow-600' },
  confirmed:        { label: 'Confirmed',        icon: CheckCircle, color: 'text-blue-600'   },
  preparing:        { label: 'Preparing',        icon: ChefHat,     color: 'text-orange-600' },
  out_for_delivery: { label: 'Out for delivery', icon: Bike,        color: 'text-purple-600' },
  delivered:        { label: 'Delivered',        icon: CheckCircle, color: 'text-green-600'  },
  cancelled:        { label: 'Cancelled',        icon: XCircle,     color: 'text-red-600'    },
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router  = useRouter()
  const addItem = useCart(s => s.addItem)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'amount'>('newest')
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status === 'authenticated') {
      fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) })
    }
  }, [status])

  const reorder = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setReordering(orderId)
    const res = await fetch('/api/orders/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    const d = await res.json()
    setReordering(null)
    if (res.ok && d.items?.length) {
      d.items.forEach((item: any) => addItem(item, item.qty))
      toast.success('Items added to cart! 🛒')
      document.dispatchEvent(new Event('open-cart'))
    } else toast.error(d.error || 'Could not reorder — items may be unavailable')
  }

  const cancelOrder = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Cancel this order?')) return
    setCancelling(orderId)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel: true }),
    })
    setCancelling(null)
    if (res.ok) {
      setOrders(os => os.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o))
      toast.success('Order cancelled')
    } else {
      const d = await res.json()
      toast.error(d.error || 'Could not cancel')
    }
  }

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .sort((a, b) => {
      if (sort === 'amount') return b.total - a.total
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="page-shell min-h-screen pb-20">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-green-900 dark:text-white mb-4">My Orders</h1>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {['all', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${filter === s ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 border border-green-200 dark:border-gray-700 text-gray-500'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)} className="input text-sm py-2 mb-4 w-full sm:w-auto">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount">Highest amount</option>
        </select>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-green-500" size={32}/></div>
        ) : filtered.length === 0 ? (
          <EmptyState emoji="📦" title="No orders found" description="Try a different filter" actionLabel="Clear filter" onAction={() => setFilter('all')} />
        ) : (
          <div className="space-y-4">
            {filtered.map((order: any) => {
              const meta = STATUS_META[order.status] || STATUS_META.pending
              const Icon = meta.icon
              return (
                <div key={order._id} className="card p-5 hover:border-green-300 hover:shadow-card-hover transition-all group">
                  <Link href={`/orders/${order._id}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                        <Icon size={20} className={meta.color}/>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className={`text-xs font-semibold mt-1 ${meta.color}`}>{meta.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-green-600">₹{order.total}</span>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-green-500 transition-colors"/>
                    </div>
                  </Link>
                  {order.status === 'delivered' && (
                    <button
                      onClick={e => reorder(e, order._id)}
                      disabled={reordering === order._id}
                      className="mt-3 w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                    >
                      {reordering === order._id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      Reorder
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={e => cancelOrder(e, order._id)}
                      disabled={cancelling === order._id}
                      className="mt-3 w-full text-sm py-2 flex items-center justify-center gap-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-semibold"
                    >
                      {cancelling === order._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Cancel order
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
