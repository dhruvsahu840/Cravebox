'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'


export default function LoginForm() {
   const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (res?.ok) { toast.success('Welcome back! 👋'); router.push(callbackUrl); router.refresh() }
    else toast.error('Invalid email or password')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-black text-green-900">
            🌿 Crave<span className="text-green-600">Box</span>
          </Link>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8 border-green-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading && <Loader2 size={18} className="animate-spin"/>}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">Create one</Link>
          </p>
        </div>

        <div className="mt-4 p-4 bg-white border border-green-100 rounded-xl text-xs text-gray-400 text-center">
          <p className="font-semibold text-gray-500 mb-1">Admin access</p>
          <p>Register using the email set in <code className="text-green-600">ADMIN_EMAIL</code> env var</p>
        </div>
      </div>
    </div>
  )
}