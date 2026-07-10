'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { RotateCcw } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import toast from 'react-hot-toast'

export function RepeatOrderBanner() {
  const { data: session } = useSession()
  const [order, setOrder] = useState<any>(null)
  const addItem = useCart(s => s.addItem)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/orders/last').then(r => r.json()).then(d => setOrder(d.order)).catch(() => {})
  }, [session?.user?.id])

  if (!session || !order?.items?.length) return null

  const reorder = async () => {
    const res = await fetch('/api/orders/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order._id }),
    })
    const d = await res.json()
    if (res.ok && d.items?.length) {
      d.items.forEach((i: any) => addItem(i, i.qty))
      toast.success('Last order added to cart!')
      document.dispatchEvent(new Event('open-cart'))
    } else toast.error('Could not repeat order')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-3">
      <button onClick={reorder} className="w-full card p-4 flex items-center justify-between gap-3 hover:shadow-card-hover transition-all group">
        <div className="text-left">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Order again</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">
            {order.items.slice(0, 2).map((i: any) => i.name).join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </p>
          <p className="text-xs text-gray-400">₹{order.total} · {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 text-green-600 font-bold text-sm shrink-0 group-hover:gap-3 transition-all">
          <RotateCcw size={16} /> Repeat
        </div>
      </button>
    </div>
  )
}
