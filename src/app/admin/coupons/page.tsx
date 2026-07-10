'use client'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Plus, Trash2, ToggleRight, ToggleLeft, Loader2, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { code: '', type: 'percent', value: '', minOrder: '', maxDiscount: '', usageLimit: '100', expiresAt: '' }

export default function AdminCoupons() {
  const [coupons, setCoupons]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState<any>(EMPTY)
  const [saving, setSaving]       = useState(false)

  const fetch_ = async () => {
    const res = await fetch('/api/coupons')
    const d   = await res.json()
    setCoupons(d.coupons || [])
    setLoading(false)
  }
  useEffect(() => { fetch_() }, [])

  const save = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return }
    setSaving(true)
    const res  = await fetch('/api/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        value:       Number(form.value),
        minOrder:    Number(form.minOrder)    || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit:  Number(form.usageLimit)  || 100,
        expiresAt:   form.expiresAt || undefined,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setCoupons(cs => [data.coupon, ...cs])
      setForm(EMPTY); setShowForm(false)
      toast.success('Coupon created!')
    } else {
      toast.error(data.error)
    }
  }

  const toggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) setCoupons(cs => cs.map(c => c._id === id ? { ...c, isActive: !current } : c))
  }

  const del = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
    setCoupons(cs => cs.filter(c => c._id !== id))
    toast.success('Deleted')
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  return (
    <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-green-900 flex items-center gap-2"><Ticket size={22} className="text-green-600" /> Coupons</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
            <Plus size={16} /> Add coupon
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card p-5 mb-6 border-green-200">
            <h2 className="font-bold text-green-900 mb-4">New coupon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Code *</label>
                <input className="input text-sm font-mono uppercase" placeholder="SAVE20" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Type *</label>
                <select className="input text-sm" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Value *</label>
                <input type="number" className="input text-sm" placeholder={form.type === 'percent' ? '20' : '50'} value={form.value} onChange={e => set('value', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Min order (₹)</label>
                <input type="number" className="input text-sm" placeholder="199" value={form.minOrder} onChange={e => set('minOrder', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Max discount (₹)</label>
                <input type="number" className="input text-sm" placeholder="100" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Usage limit</label>
                <input type="number" className="input text-sm" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Expires at</label>
                <input type="date" className="input text-sm" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
                {saving && <Loader2 size={14} className="animate-spin" />} Create coupon
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY) }} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden border-green-100">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-green-100 text-gray-500 text-xs uppercase bg-green-50">
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Discount</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Min order</th>
                <th className="px-5 py-3 text-center hidden md:table-cell">Used / Limit</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Expires</th>
                <th className="px-5 py-3 text-center">Active</th>
                <th className="px-5 py-3 text-right">Del</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="inline animate-spin text-green-500" size={24} /></td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No coupons yet</td></tr>
              ) : coupons.map(c => (
                <tr key={c._id} className="border-b border-green-50 hover:bg-green-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <code className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg">{c.code}</code>
                  </td>
                  <td className="px-5 py-4 font-semibold text-green-600 hidden md:table-cell">
                    {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} off
                    {c.maxDiscount ? <span className="text-gray-400 text-xs"> (max ₹{c.maxDiscount})</span> : ''}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">₹{c.minOrder || 0}</td>
                  <td className="px-5 py-4 text-center hidden md:table-cell">
                    <span className="text-gray-600">{c.usedCount}</span>
                    <span className="text-gray-400"> / {c.usageLimit}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs hidden lg:table-cell">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggle(c._id, c.isActive)}>
                      {c.isActive ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => del(c._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors ml-auto">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
    </AdminLayout>
  )
}
