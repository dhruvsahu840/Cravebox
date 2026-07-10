'use client'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Loader2, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

const COLUMNS = [
  { key: 'pending', label: 'New', color: 'border-yellow-400' },
  { key: 'confirmed', label: 'Confirmed', color: 'border-blue-400' },
  { key: 'preparing', label: 'Preparing', color: 'border-orange-400' },
  { key: 'out_for_delivery', label: 'Out for delivery', color: 'border-purple-400' },
  { key: 'delivered', label: 'Delivered', color: 'border-green-400' },
]

const NEXT: Record<string, string> = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered',
}

export default function AdminKanbanPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  const fetchOrders = () => {
    fetch('/api/orders?limit=100').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) })
  }

  useEffect(() => { fetchOrders(); const id = setInterval(fetchOrders, 15000); return () => clearInterval(id) }, [])

  const advance = async (order: any) => {
    const next = NEXT[order.status]
    if (!next) return
    const res = await fetch(`/api/orders/${order._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    if (res.ok) { fetchOrders(); toast.success(`#${order.orderNumber} → ${next.replace(/_/g, ' ')}`) }
  }

  const bulkAdvance = async (status: string) => {
    const next = NEXT[status]
    if (!next) return
    const ids = orders.filter(o => o.status === status).map(o => o._id)
    if (!ids.length) return
    await fetch('/api/admin/orders/bulk', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderIds: ids, status: next }) })
    fetchOrders()
    toast.success(`${ids.length} orders updated`)
  }

  const printTicket = (order: any) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><body style="font-family:monospace;padding:20px"><h2>KITCHEN TICKET</h2><p>#${order.orderNumber}</p><p>${new Date().toLocaleString()}</p><hr>${order.items.map((i: any) => `<p><b>${i.qty}x</b> ${i.name}</p>`).join('')}<hr><p>${order.address?.line1}, ${order.address?.city}</p></body></html>`)
    w.print()
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-green-900">Live Order Board</h1>
        <a href="/api/admin/orders/export" className="btn-secondary text-sm px-4 py-2">Export CSV</a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.key)
          return (
            <div key={col.key} className={`shrink-0 w-64 card border-t-4 ${col.color}`}>
              <div className="p-3 border-b border-green-100 flex items-center justify-between">
                <span className="font-bold text-sm">{col.label}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{colOrders.length}</span>
              </div>
              {NEXT[col.key] && colOrders.length > 0 && (
                <button onClick={() => bulkAdvance(col.key)} className="w-full text-xs py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold">
                  Move all → {NEXT[col.key].replace(/_/g, ' ')}
                </button>
              )}
              <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                {colOrders.map(order => (
                  <div key={order._id} className="bg-green-50/50 rounded-xl p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold">#{order.orderNumber}</p>
                      <button onClick={() => printTicket(order)} className="text-gray-400 hover:text-green-600"><Printer size={14} /></button>
                    </div>
                    <p className="text-xs text-gray-500">{order.user?.name}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.items?.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}</p>
                    <p className="font-bold text-green-600 mt-2">₹{order.total}</p>
                    {NEXT[order.status] && (
                      <button onClick={() => advance(order)} className="btn-primary w-full mt-2 py-1.5 text-xs">
                        → {NEXT[order.status].replace(/_/g, ' ')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
