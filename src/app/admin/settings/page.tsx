'use client'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Loader2, Save, Percent, Truck, ShoppingBag, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '@/store/settingsStore'

export default function AdminSettingsPage() {
  const setSettings = useSettings(s => s.setSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    taxPercent: 5,
    deliveryFee: 40,
    freeDeliveryMin: 299,
    minOrder: 99,
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setForm({
            taxPercent: Math.round(d.settings.taxRate * 1000) / 10,
            deliveryFee: d.settings.deliveryFee,
            freeDeliveryMin: d.settings.freeDeliveryMin,
            minOrder: d.settings.minOrder,
          })
        }
        setLoading(false)
      })
  }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taxRate: form.taxPercent,
        deliveryFee: form.deliveryFee,
        freeDeliveryMin: form.freeDeliveryMin,
        minOrder: form.minOrder,
      }),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) {
      toast.success('Settings saved!')
      if (d.settings) {
        setSettings(d.settings)
        setForm({
          taxPercent: Math.round(d.settings.taxRate * 1000) / 10,
          deliveryFee: d.settings.deliveryFee,
          freeDeliveryMin: d.settings.freeDeliveryMin,
          minOrder: d.settings.minOrder,
        })
      }
    } else toast.error(d.error || 'Failed to save')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={32} /></div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-xl sm:text-2xl font-black text-green-900 mb-2">Store Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Control tax rate and delivery charges applied at checkout.</p>

      <div className="card p-5 sm:p-6 max-w-lg space-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
            <Percent size={14} className="text-green-600" /> Tax rate (%)
          </label>
          <input
            type="number"
            min={0}
            max={30}
            step={0.1}
            className="input text-sm"
            value={form.taxPercent}
            onChange={e => setForm(f => ({ ...f, taxPercent: parseFloat(e.target.value) || 0 }))}
          />
          <p className="text-xs text-gray-500 mt-1">Applied to subtotal (0–30%)</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
            <Truck size={14} className="text-green-600" /> Delivery charge (₹)
          </label>
          <input
            type="number"
            min={0}
            max={500}
            className="input text-sm"
            value={form.deliveryFee}
            onChange={e => setForm(f => ({ ...f, deliveryFee: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
            <IndianRupee size={14} className="text-green-600" /> Free delivery above (₹)
          </label>
          <input
            type="number"
            min={0}
            className="input text-sm"
            value={form.freeDeliveryMin}
            onChange={e => setForm(f => ({ ...f, freeDeliveryMin: parseInt(e.target.value) || 0 }))}
          />
          <p className="text-xs text-gray-500 mt-1">Orders at or above this subtotal get free delivery</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
            <ShoppingBag size={14} className="text-green-600" /> Minimum order (₹)
          </label>
          <input
            type="number"
            min={0}
            className="input text-sm"
            value={form.minOrder}
            onChange={e => setForm(f => ({ ...f, minOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </AdminLayout>
  )
}
