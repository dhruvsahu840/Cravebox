'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Printer, Download } from 'lucide-react'
import Link from 'next/link'

export default function InvoicePage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => setOrder(d.order))
  }, [id])

  if (!order) return <div className="invoice-shell p-10 text-center text-gray-700">Loading invoice…</div>

  return (
    <div className="invoice-shell max-w-lg mx-auto p-8 bg-white text-gray-900 min-h-screen">
      <div className="flex justify-between items-start mb-6 no-print">
        <Link href={`/orders/${id}`} className="text-green-600 text-sm font-bold">← Back</Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><Printer size={14} /> Print</button>
        </div>
      </div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-green-900">CraveBox</h1>
        <p className="text-gray-500 text-sm">Tax Invoice</p>
      </div>
      <div className="space-y-2 text-sm mb-6 text-gray-800">
        <div className="flex justify-between"><span className="text-gray-600">Invoice #</span><span className="font-bold text-gray-900">{order.orderNumber}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="text-gray-900">{new Date(order.createdAt).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="capitalize text-gray-900">{order.status.replace(/_/g, ' ')}</span></div>
      </div>
      <table className="w-full text-sm mb-4 text-gray-900">
        <thead><tr className="border-b border-gray-200"><th className="text-left py-2 text-gray-700">Item</th><th className="text-right py-2 text-gray-700">Qty</th><th className="text-right py-2 text-gray-700">Amount</th></tr></thead>
        <tbody>
          {order.items.map((i: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-2 text-gray-900">{i.name}</td>
              <td className="text-right py-2 text-gray-900">{i.qty}</td>
              <td className="text-right py-2 text-gray-900">₹{i.price * i.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-1 text-sm border-t border-gray-200 pt-3 text-gray-800">
        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">₹{order.subtotal}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="text-gray-900">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Tax</span><span className="text-gray-900">₹{order.tax}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{order.discount}</span></div>}
        <div className="flex justify-between font-black text-lg pt-2 text-gray-900"><span>Total</span><span className="text-green-600">₹{order.total}</span></div>
      </div>
      <p className="text-xs text-gray-500 mt-8 text-center">Thank you for ordering from CraveBox · Bhopal, MP</p>
    </div>
  )
}
