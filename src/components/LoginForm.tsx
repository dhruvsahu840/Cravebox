'use client'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'NotAdmin') {
      toast.error('Admin access only. Sign in with your admin account.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    const res = await signIn('credentials', {
      email: form.email.toLowerCase().trim(),
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success('Welcome back! 👋')
      router.push(callbackUrl)
      router.refresh()
    } else {
      toast.error(res?.error === 'CredentialsSignin' ? 'Invalid email or password' : 'Sign in failed. Try again.')
    }
  }

  const sendReset = async () => {
    if (!forgotEmail) { toast.error('Enter your email'); return }
    setForgotLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail }),
    })
    const d = await res.json()
    setForgotLoading(false)
    if (res.ok) {
      toast.success(d.message || 'Check your phone/email for reset link')
      if (d.demoResetLink) {
        toast((t) => (
          <span>
            Demo link ready —{' '}
            <a className="underline font-bold" href={d.demoResetLink} onClick={() => toast.dismiss(t.id)}>open reset</a>
          </span>
        ), { duration: 12000 })
      }
      setForgotOpen(false)
    } else toast.error(d.error || 'Could not start reset')
  }

  return (
    <div className="page-shell min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-400 dark:text-gray-500 mt-4">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => { setForgotEmail(form.email); setForgotOpen(true) }}
                className="text-xs font-semibold text-green-600 hover:text-green-700">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading && <Loader2 size={18} className="animate-spin"/>}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">Create one</Link>
          </p>
        </div>
      </div>

      {forgotOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setForgotOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-50 card p-5 space-y-3">
            <h3 className="font-bold text-lg text-green-900">Reset password</h3>
            <p className="text-xs text-gray-500">We&apos;ll send a reset link to your registered phone (SMS) if available.</p>
            <input className="input text-sm" type="email" placeholder="Your account email" value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setForgotOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={sendReset} disabled={forgotLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {forgotLoading && <Loader2 size={14} className="animate-spin" />}
                Send link
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
