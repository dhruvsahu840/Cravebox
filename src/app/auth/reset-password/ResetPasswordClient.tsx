'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/shared/Logo'

export default function ResetPasswordClient() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [token, setToken] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password }),
    })
    const d = await res.json()
    setLoading(false)
    if (res.ok) {
      toast.success(d.message || 'Password updated')
      router.push('/auth/login')
    } else toast.error(d.error || 'Could not reset password')
  }

  return (
    <div className="page-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><Logo size="lg" /></div>
        <div className="card p-8">
          <h1 className="text-xl font-black text-green-900 mb-4">Set new password</h1>
          <form onSubmit={submit} className="space-y-4">
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" placeholder="Reset token" value={token} onChange={e => setToken(e.target.value)} required />
            <input className="input" type="password" placeholder="New password (min 6)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <button disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Update password
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-4">
            <Link href="/auth/login" className="text-green-600 font-semibold">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
