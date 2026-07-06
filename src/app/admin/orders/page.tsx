'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ChevronRight, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUSES = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
const STATUS_COLOR: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed', preparing: 'badge-preparing',
  out_for_delivery: 'badge-out', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
}
const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered',
}

export default function AdminOrders() {
  const [orders, setOrders]       = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeStatus, setStatus] = useState('all')
  const [search, setSearch]       = useState('')
  const [updating, setUpdating]   = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const url = `/api/orders?limit=50${activeStatus !== 'all' ? `&status=${activeStatus}` : ''}`
    const res = await fetch(url); const d = await res.json()
    setOrders(d.orders || []); setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [activeStatus])

  const advanceStatus = async (order: any) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(order._id)
    const res = await fetch(`/api/orders/${order._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    if (res.ok) { setOrders(os => os.map(o => o._id === order._id ? { ...o, status: next } : o)); toast.success(`Order moved to: ${next.replace(/_/g, ' ')}`) }
    setUpdating(null)
  }

  const filtered = orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex min-h-screen bg-green-50">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black text-green-900 mb-6">Orders</h1>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${activeStatus === s ? 'bg-green-600 text-white' : 'bg-white border border-green-200 text-gray-500 hover:bg-green-50'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative mb-5 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input className="input pl-9 text-sm py-2" placeholder="Search order # or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-100 text-gray-400 text-xs uppercase bg-green-50">
                <th className="px-5 py-3 text-left">Order</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Customer</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Items</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="inline animate-spin text-green-500" size={24}/></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order._id} className="border-b border-green-50 hover:bg-green-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="font-medium text-gray-800">{order.user?.name}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-500">
                    {order.items?.slice(0, 2).map((i: any) => i.name).join(', ')}{order.items?.length > 2 && ` +${order.items.length - 2} more`}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-green-600">₹{order.total}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLOR[order.status] || ''}`}>{order.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {NEXT_STATUS[order.status] && (
                      <button onClick={() => advanceStatus(order)} disabled={updating === order._id} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 mx-auto">
                        {updating === order._id ? <Loader2 size={12} className="animate-spin"/> : `→ ${NEXT_STATUS[order.status].replace(/_/g, ' ')}`}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order._id}`} className="text-gray-300 hover:text-green-600 transition-colors"><ChevronRight size={16}/></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
