'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProductModal } from '@/components/admin/ProductModal'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<any>(null)
  const [selected, setSelected]   = useState<string[]>([])

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const selectAll = () => setSelected(selected.length === products.length ? [] : products.map(p => p._id))

  const bulkToggle = async (available: boolean) => {
    await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: available }) })))
    setProducts(ps => ps.map(p => selected.includes(p._id) ? { ...p, isAvailable: available } : p))
    setSelected([])
    toast.success(`${selected.length} products updated`)
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} products?`)) return
    await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'DELETE' })))
    setProducts(ps => ps.filter(p => !selected.includes(p._id)))
    setSelected([])
    toast.success('Products deleted')
  }

  const fetchProducts = async () => {
    const [pRes, cRes] = await Promise.all([
      fetch(`/api/products?${search ? `search=${search}` : ''}`),
      fetch('/api/categories'),
    ])
    const pd = await pRes.json()
    const cd = await cRes.json()
    setProducts(pd.products || [])
    setCategories(cd.categories || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [search])

  const toggleAvailability = async (id: string, current: boolean) => {
    await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: !current }) })
    setProducts(ps => ps.map(p => p._id === id ? { ...p, isAvailable: !current } : p))
    toast.success('Updated!')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(ps => ps.filter(p => p._id !== id))
    toast.success('Product deleted')
  }

  const onSave = (product: any) => {
    if (editing) setProducts(ps => ps.map(p => p._id === product._id ? product : p))
    else setProducts(ps => [product, ...ps])
    setModalOpen(false); setEditing(null)
  }

  return (
    <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-green-900">Products</h1>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
            <Plus size={18}/> Add product
          </button>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input className="input pl-9 text-sm" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <span className="text-sm font-bold text-green-800 self-center">{selected.length} selected</span>
            <button onClick={() => bulkToggle(true)} className="btn-primary text-xs py-1.5 px-3">Enable all</button>
            <button onClick={() => bulkToggle(false)} className="btn-secondary text-xs py-1.5 px-3">Disable all</button>
            <button onClick={bulkDelete} className="text-xs py-1.5 px-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50">Delete</button>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-green-100 text-gray-400 text-xs uppercase bg-green-50">
                <th className="px-3 py-3"><input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={selectAll} /></th>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Category</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-center">Available</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="inline animate-spin text-green-500" size={24}/></td></tr>
              ) : products.map(product => (
                <tr key={product._id} className="border-b border-green-50 hover:bg-green-50/50 transition-colors">
                  <td className="px-3 py-4"><input type="checkbox" checked={selected.includes(product._id)} onChange={() => toggleSelect(product._id)} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0]
                          ? <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-cover w-full h-full"/>
                          : <div className="w-full h-full flex items-center justify-center text-xl">🍕</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <p className="text-gray-400 text-xs">{product.isVeg ? '🟢 Veg' : '🔴 Non-veg'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm hidden md:table-cell">{product.category?.name}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-green-600">₹{product.discountedPrice || product.price}</span>
                    {product.discountedPrice && <span className="text-gray-300 text-xs line-through ml-1">₹{product.price}</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAvailability(product._id, product.isAvailable)}>
                      {product.isAvailable ? <ToggleRight size={24} className="text-green-500"/> : <ToggleLeft size={24} className="text-gray-300"/>}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(product); setModalOpen(true) }} className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => deleteProduct(product._id)} className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

      {modalOpen && (
        <ProductModal product={editing} categories={categories} onClose={() => { setModalOpen(false); setEditing(null) }} onSave={onSave} />
      )}
    </AdminLayout>
  )
}
