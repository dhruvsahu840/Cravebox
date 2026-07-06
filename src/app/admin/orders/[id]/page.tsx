'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ArrowLeft, Loader2, MapPin, Phone, User, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ALL_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
const STATUS_COLOR: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed', preparing: 'badge-preparing',
  out_for_delivery: 'badge-out', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [agent, setAgent]     = useState({ name: '', phone: '' })

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => {
      setOrder(d.order); if (d.order?.deliveryAgent) setAgent(d.order.deliveryAgent); setLoading(false)
    })
  }, [id])

  const updateStatus = async (status: string) => {
    setSaving(true)
    const res  = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const data = await res.json()
    if (res.ok) { setOrder(data.order); toast.success('Status updated!') } else toast.error(data.error)
    setSaving(false)
  }

  const saveAgent = async () => {
    setSaving(true)
    const res  = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliveryAgent: agent }) })
    const data = await res.json()
    if (res.ok) { setOrder(data.order); toast.success('Delivery agent saved!') } else toast.error(data.error)
    setSaving(false)
  }

  if (loading) return (
    <div className="flex min-h-screen bg-green-50">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-green-500" size={32}/></main>
    </div>
  )
  if (!order) return (
    <div className="flex min-h-screen bg-green-50">
      <AdminSidebar /><main className="flex-1 flex items-center justify-center text-gray-400">Order not found</main>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-green-50">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/orders" className="btn-ghost p-2"><ArrowLeft size={18}/></Link>
          <div>
            <h1 className="text-xl font-black text-green-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_COLOR[order.status]}`}>{order.status.replace(/_/g, ' ')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5">
              <h2 className="font-bold text-gray-700 mb-4">Order items</h2>
              <div className="space-y-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{item.qty}× {item.name}</p>
                      {item.customizations && <p className="text-gray-400 text-xs">{item.customizations}</p>}
                    </div>
                    <span className="text-green-600 font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-green-100 mt-4 pt-4 space-y-1.5 text-sm text-gray-500">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between"><span>Delivery fee</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
                <div className="flex justify-between"><span>Tax (5%)</span><span>₹{order.tax}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
                <div className="flex justify-between font-black text-base text-green-900 border-t border-green-100 pt-2 mt-1">
                  <span>Total</span><span className="text-green-600">₹{order.total}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-gray-700 mb-4">Status history</h2>
              <div className="space-y-3">
                {order.statusHistory.map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"/>
                    <div>
                      <span className="font-semibold capitalize text-gray-800">{h.status.replace(/_/g, ' ')}</span>
                      {h.note && <span className="text-gray-400 ml-2">— {h.note}</span>}
                      <p className="text-gray-300 text-xs">{new Date(h.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-gray-700 mb-4">Assign delivery agent</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input className="input text-sm" placeholder="Agent name" value={agent.name} onChange={e => setAgent(a => ({ ...a, name: e.target.value }))} />
                <input className="input text-sm" placeholder="Agent phone" value={agent.phone} onChange={e => setAgent(a => ({ ...a, phone: e.target.value }))} />
              </div>
              <button onClick={saveAgent} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin"/>} Save agent
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <h2 className="font-bold text-gray-700 mb-4">Customer</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700"><User size={15} className="text-gray-400"/> {order.user?.name}</div>
                <div className="flex items-center gap-2 text-gray-500"><CreditCard size={15} className="text-gray-400"/> {order.user?.email}</div>
                {order.user?.phone && <a href={`tel:${order.user.phone}`} className="flex items-center gap-2 text-green-600 hover:underline"><Phone size={15}/> {order.user.phone}</a>}
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                  <span>{order.address?.line1}, {order.address?.city} – {order.address?.pincode}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-gray-700 mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Method</span><span className="capitalize font-semibold text-gray-800">{order.payment.method}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-bold ${order.payment.status === 'paid' ? 'text-green-600' : order.payment.status === 'failed' ? 'text-red-500' : 'text-yellow-600'}`}>{order.payment.status}</span>
                </div>
                {order.payment.razorpayPaymentId && (
                  <div className="flex justify-between"><span className="text-gray-400">Razorpay ID</span><span className="font-mono text-xs text-gray-500">{order.payment.razorpayPaymentId.slice(-8)}</span></div>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-gray-700 mb-4">Update status</h2>
              <div className="space-y-2">
                {ALL_STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(s)} disabled={saving || order.status === s}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${order.status === s ? 'bg-green-50 border border-green-300 text-green-700 cursor-default' : 'bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-700'}`}>
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
