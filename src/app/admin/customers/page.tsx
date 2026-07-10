'use client'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Search, ToggleRight, ToggleLeft, Loader2, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const [users, setUsers]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?page=${page}&search=${search}`)
    const d   = await res.json()
    setUsers(d.users || []); setPages(d.pages || 1); setLoading(false)
  }
  useEffect(() => { fetch_() }, [page, search])

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) })
    if (res.ok) { setUsers(us => us.map(u => u._id === id ? { ...u, isActive: !current } : u)); toast.success(current ? 'User disabled' : 'User enabled') }
  }

  return (
    <AdminLayout>
        <h1 className="text-xl sm:text-2xl font-black text-green-900 mb-4 sm:mb-6">Customers</h1>

        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input className="input pl-9 text-sm" placeholder="Search name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-green-100 text-gray-400 text-xs uppercase bg-green-50">
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Phone</th>
                <th className="px-5 py-3 text-center hidden md:table-cell">Orders</th>
                <th className="px-5 py-3 text-right hidden md:table-cell">Total spent</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="inline animate-spin text-green-400" size={24}/></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No customers found</td></tr>
              ) : users.map(user => (
                <tr key={user._id} className="border-b border-green-50 hover:bg-green-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-green-600"><User size={16}/></div>
                      <div><p className="font-semibold text-gray-900">{user.name}</p><p className="text-gray-400 text-xs">{user.email}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">{user.phone || '—'}</td>
                  <td className="px-5 py-4 text-center hidden md:table-cell"><span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{user.orderCount}</span></td>
                  <td className="px-5 py-4 text-right font-bold text-green-600 hidden md:table-cell">{user.totalSpent > 0 ? `₹${user.totalSpent.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleActive(user._id, user.isActive)}>
                      {user.isActive ? <ToggleRight size={24} className="text-green-500"/> : <ToggleLeft size={24} className="text-gray-400"/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-green-100">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-gray-400 text-sm">Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
          </div>
        </div>
    </AdminLayout>
  )
}
