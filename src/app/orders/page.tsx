'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChefHat, Bike, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/user/Navbar'

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
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status === 'authenticated') {
      fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) })
    }
  }, [status])

  return (
    <main className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-green-900 mb-6">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-green-500" size={32}/></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30 text-green-300"/>
            <p className="text-lg font-semibold mb-2 text-gray-600">No orders yet</p>
            <p className="text-sm mb-6">Time to order something delicious!</p>
            <Link href="/" className="btn-primary inline-block">Browse menu</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const meta = STATUS_META[order.status] || STATUS_META.pending
              const Icon = meta.icon
              return (
                <Link key={order._id} href={`/orders/${order._id}`}
                  className="card p-5 flex items-center justify-between hover:border-green-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <Icon size={20} className={meta.color}/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">#{order.orderNumber}</p>
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
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
