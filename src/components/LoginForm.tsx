'use client'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type Mode = 'phone' | 'email'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [mode, setMode] = useState<Mode>('phone')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [optionalEmail, setOptionalEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'NotAdmin') {
      toast.error('Admin access only. Sign in with your admin email & password.')
      setMode('email')
    }
  }, [searchParams])

  const sendOtp = async () => {
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit phone'); return }
    setLoading(true)
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, purpose: 'login' }),
    })
    const d = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(d.error || 'Failed to send OTP'); return }
    setStep('otp')
    if (d.demoOtp) toast.success(`Demo OTP: ${d.demoOtp}`, { duration: 10000 })
    else toast.success(d.message || 'OTP sent on WhatsApp')
  }

  const verifyOtp = async () => {
    if (otp.length < 4) { toast.error('Enter the OTP'); return }
    setLoading(true)
    const res = await signIn('phone-otp', {
      phone,
      otp,
      name: name.trim() || undefined,
      email: optionalEmail.trim() || undefined,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success('Welcome!')
      router.push(callbackUrl.startsWith('/admin') ? '/' : callbackUrl)
      router.refresh()
    } else toast.error('Invalid or expired OTP')
  }

  const emailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminEmail || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    const res = await signIn('admin-credentials', {
      email: adminEmail.toLowerCase().trim(),
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success('Welcome back!')
      const dest = callbackUrl.startsWith('/admin') ? callbackUrl : '/admin/dashboard'
      router.push(dest)
      router.refresh()
    } else {
      toast.error('Invalid email or password')
    }
  }

  return (
    <div className="page-shell min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-400 dark:text-gray-500 mt-4">Sign in to LifePizza</p>
        </div>

        <div className="card p-8 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-green-50 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${mode === 'phone' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
              USER LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${mode === 'email' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
              ADMIN LOGIN 
            </button>
          </div>

          {mode === 'phone' ? (
            step === 'phone' ? (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Name</label>
                  <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Phone *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input pl-9"
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <button onClick={sendOtp} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? 'Sending…' : 'Send WhatsApp OTP'}
                </button>
                 <p className="text-[11px] text-center text-gray-400">
                For User's accounts (phone and otp).  Admin use email and password.
              </p>

              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">Enter the 4-digit code sent to WhatsApp · {phone}</p>
                <input
                  className="input text-center text-2xl tracking-[0.4em] font-bold"
                  placeholder="----"
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button onClick={verifyOtp} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Verify & continue
                </button>
                <button type="button" onClick={() => setStep('phone')} className="text-xs text-green-600 font-semibold w-full">
                  Change number
                </button>
              </>
            )
          ) : (
            <form onSubmit={emailLogin} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="admin@lifepizza.in"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <p className="text-[11px] text-center text-gray-400">
                For admin accounts (email & password). Customers use Phone OTP.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
