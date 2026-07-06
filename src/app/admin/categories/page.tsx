'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Pencil, Trash2, Loader2, ToggleRight, ToggleLeft, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [newName, setNewName]       = useState('')
  const [saving, setSaving]         = useState(false)
  const [editId, setEditId]         = useState<string | null>(null)
  const [editName, setEditName]     = useState('')

  const fetchAll = async () => {
    const res = await fetch('/api/categories'); const d = await res.json()
    setCategories(d.categories || []); setLoading(false)
  }
  useEffect(() => { fetchAll() }, [])

  const createCategory = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const res  = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim() }) })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { setCategories(cs => [...cs, data.category]); setNewName(''); setAdding(false); toast.success('Category created!') }
    else toast.error(data.error)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    setSaving(true)
    const res  = await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName.trim() }) })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { setCategories(cs => cs.map(c => c._id === id ? data.category : c)); setEditId(null); toast.success('Updated!') }
    else toast.error(data.error)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res  = await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) })
    const data = await res.json()
    if (res.ok) { setCategories(cs => cs.map(c => c._id === id ? { ...c, isActive: !current } : c)); toast.success('Updated!') }
    else toast.error(data.error)
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    const res  = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) { setCategories(cs => cs.filter(c => c._id !== id)); toast.success('Deleted!') }
    else toast.error(data.error)
  }

  return (
    <div className="flex min-h-screen bg-green-50">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-green-900">Categories</h1>
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={18}/> Add category
          </button>
        </div>

        {adding && (
          <div className="card p-4 mb-6 flex items-center gap-3">
            <input autoFocus className="input flex-1 text-sm py-2" placeholder="Category name e.g. Pizza, Burger..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCategory()} />
            <button onClick={createCategory} disabled={saving} className="btn-primary py-2 px-4 flex items-center gap-1 text-sm">
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={16}/>} Save
            </button>
            <button onClick={() => { setAdding(false); setNewName('') }} className="btn-secondary py-2 px-4 text-sm"><X size={16}/></button>
          </div>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-400" size={28}/></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No categories yet. Add one above.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-100 text-gray-400 text-xs uppercase bg-green-50">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Slug</th>
                  <th className="px-5 py-3 text-center">Active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id} className="border-b border-green-50 hover:bg-green-50/50 transition-colors">
                    <td className="px-5 py-4">
                      {editId === cat._id ? (
                        <div className="flex items-center gap-2">
                          <input autoFocus className="input text-sm py-1.5 flex-1" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(cat._id)} />
                          <button onClick={() => saveEdit(cat._id)} className="text-green-600 hover:text-green-700">{saving ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}</button>
                          <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                        </div>
                      ) : <span className="font-semibold text-gray-900">{cat.name}</span>}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm hidden md:table-cell font-mono">{cat.slug}</td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => toggleActive(cat._id, cat.isActive)}>
                        {cat.isActive ? <ToggleRight size={24} className="text-green-500"/> : <ToggleLeft size={24} className="text-gray-300"/>}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditId(cat._id); setEditName(cat.name) }} className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => deleteCategory(cat._id)} className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
