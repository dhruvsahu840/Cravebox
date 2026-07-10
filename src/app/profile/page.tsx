'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { MapPin, Plus, Trash2, Star, Loader2, User, Heart } from 'lucide-react'
import { useWishlist } from '@/store/wishlistStore'
import { useCart } from '@/store/cartStore'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ label: 'Home', line1: '', city: 'Bhopal', pincode: '' })
  const wishlist = useWishlist(s => s.items)
  const addItem = useCart(s => s.addItem)

  const fetchProfile = async () => {
    const res = await fetch('/api/profile')
    const d = await res.json()
    if (res.ok) setUser(d.user)
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') fetchProfile()
  }, [status])

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, phone: user.phone }),
    })
    setSaving(false)
    if (res.ok) toast.success('Profile updated!')
    else toast.error('Failed to update')
  }

  const addAddress = async () => {
    if (!form.line1 || !form.pincode) { toast.error('Fill address fields'); return }
    const res = await fetch('/api/profile/addresses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (res.ok) { setUser((u: any) => ({ ...u, addresses: d.addresses })); setShowAdd(false); setForm({ label: 'Home', line1: '', city: 'Bhopal', pincode: '' }); toast.success('Address saved!') }
    else toast.error(d.error)
  }

  const deleteAddress = async (id: string) => {
    const res = await fetch(`/api/profile/addresses?id=${id}`, { method: 'DELETE' })
    const d = await res.json()
    if (res.ok) { setUser((u: any) => ({ ...u, addresses: d.addresses })); toast.success('Address removed') }
  }

  const setDefault = async (id: string) => {
    const res = await fetch('/api/profile/addresses', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const d = await res.json()
    if (res.ok) setUser((u: any) => ({ ...u, addresses: d.addresses }))
  }

  if (loading) return (
    <div className="page-shell min-h-screen"><PageBackground /><Navbar />
      <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={32} /></div>
    </div>
  )

  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-green-900 dark:text-white mb-6">My Profile</h1>

        <div className="card p-5 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Loyalty points</p>
          <p className="text-3xl font-black text-green-700 dark:text-green-300">{user?.loyaltyPoints || 0} pts</p>
          <p className="text-xs text-gray-500 mt-1">100 points = ₹10 off · Earn 10 pts per ₹100 spent</p>
        </div>

        <div className="card p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <User size={24} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <input className="input text-sm" placeholder="Name" value={user?.name || ''} onChange={e => setUser((u: any) => ({ ...u, name: e.target.value }))} />
            <input className="input text-sm" placeholder="Phone" value={user?.phone || ''} onChange={e => setUser((u: any) => ({ ...u, phone: e.target.value }))} />
            <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm w-full">
              {saving ? <Loader2 size={14} className="animate-spin inline" /> : 'Save profile'}
            </button>
          </div>
        </div>

        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-green-600" /> Saved addresses</h2>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          {showAdd && (
            <div className="space-y-2 mb-4 p-4 bg-green-50/50 dark:bg-gray-800/50 rounded-xl">
              <input className="input text-sm py-2" placeholder="Label (Home, Work)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
              <input className="input text-sm py-2" placeholder="Street / flat" value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input text-sm py-2" placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                <input className="input text-sm py-2" placeholder="Pincode" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
              </div>
              <button onClick={addAddress} className="btn-primary text-sm w-full">Save address</button>
            </div>
          )}
          {user?.addresses?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No saved addresses yet</p>
          ) : (
            <div className="space-y-2">
              {user?.addresses?.map((addr: any) => (
                <div key={addr._id} className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${addr.isDefault ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{addr.label} {addr.isDefault && <span className="text-green-600 text-xs">(Default)</span>}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{addr.line1}, {addr.city} – {addr.pincode}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!addr.isDefault && <button onClick={() => setDefault(addr._id)} className="text-xs text-green-600 font-semibold px-2 py-1">Default</button>}
                    <button onClick={() => deleteAddress(addr._id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Heart size={16} className="text-red-500" /> Wishlist</h2>
            <div className="space-y-2">
              {wishlist.map(item => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-gray-800/50 rounded-xl">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { addItem(item); toast.success('Added to cart!') }} className="btn-primary text-xs py-1 px-3">Add</button>
                    <Link href="/" className="btn-secondary text-xs py-1 px-3">View</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
