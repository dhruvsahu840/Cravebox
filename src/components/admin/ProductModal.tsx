'use client'
import { useState } from 'react'
import { X, Upload, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface Props { product?: any; categories: any[]; onClose: () => void; onSave: (product: any) => void }

export function ProductModal({ product, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: product?.name || '', description: product?.description || '',
    price: product?.price || '', discountedPrice: product?.discountedPrice || '',
    category: product?.category?._id || product?.category || '', images: product?.images || [],
    isVeg: product?.isVeg ?? false, isBestseller: product?.isBestseller ?? false,
    isSpicy: product?.isSpicy ?? false, isFeatured: product?.isFeatured ?? false,
    isAvailable: product?.isAvailable ?? true, tags: product?.tags?.join(', ') || '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const uploadImage = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res  = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (res.ok) { setForm(f => ({ ...f, images: [...f.images, data.url] })); toast.success('Image uploaded!') }
    else toast.error(data.error || 'Upload failed')
  }

  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_: string, i: number) => i !== idx) }))

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) { toast.error('Name, price, and category are required'); return }
    setSaving(true)
    const payload = { ...form, price: Number(form.price), discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) }
    const url = product ? `/api/products/${product._id}` : '/api/products'
    const method = product ? 'PUT' : 'POST'
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { toast.success(product ? 'Product updated!' : 'Product created!'); onSave(data.product) }
    else toast.error(data.error || 'Failed to save')
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-green-100 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-green-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-green-900">{product ? 'Edit product' : 'Add new product'}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-green-100">
            <X size={16} className="text-gray-500"/>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Product images</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.images.map((url: string, i: number) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-green-100">
                  <Image src={url} alt="" fill className="object-cover"/>
                  <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-red-300">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors text-gray-400 hover:text-green-600">
                {uploading ? <Loader2 size={20} className="animate-spin"/> : <><Upload size={18}/><span className="text-xs mt-1">Upload</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Name *</label>
            <input className="input" placeholder="e.g. Margherita Pizza" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Description *</label>
            <textarea className="input resize-none h-20" placeholder="Short description" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Price (₹) *</label>
              <input type="number" className="input" placeholder="199" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Discounted price (₹)</label>
              <input type="number" className="input" placeholder="Optional" value={form.discountedPrice} onChange={e => set('discountedPrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Category *</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Tags (comma separated)</label>
            <input className="input" placeholder="spicy, cheese, popular" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'isVeg', label: '🟢 Vegetarian' }, { key: 'isBestseller', label: '🔥 Bestseller' },
              { key: 'isSpicy', label: '🌶️ Spicy' }, { key: 'isFeatured', label: '⭐ Featured' },
              { key: 'isAvailable', label: '✅ Available' },
            ].map(({ key, label }) => (
              <button key={key} type="button" onClick={() => set(key, !(form as any)[key])}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${(form as any)[key] ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-green-300'}`}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${(form as any)[key] ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                  {(form as any)[key] && <span className="text-white text-xs">✓</span>}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-green-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin"/> : null}
            {saving ? 'Saving...' : (product ? 'Save changes' : 'Add product')}
          </button>
        </div>
      </div>
    </div>
  )
}
