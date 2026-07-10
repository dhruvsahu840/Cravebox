'use client'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const d = await res.json()
    setLoading(false)
    if (res.ok) { toast.success(d.message); setEmail('') }
    else toast.error(d.error)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <form onSubmit={submit} className="card p-5 flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex-1 text-center sm:text-left">
          <p className="font-black text-green-900 dark:text-white">Get 10% off your first order</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Subscribe for exclusive deals</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm py-2.5" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-sm px-5 shrink-0">{loading ? '…' : 'Subscribe'}</button>
        </div>
      </form>
    </div>
  )
}
