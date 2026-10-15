
'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Phone } from 'lucide-react'
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
  const [otp, setOtp] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')

    if (err === 'NotAdmin') {
      toast.error(
        'Admin access only. Sign in with your admin email & password.'
      )
      setMode('email')
    }
  }, [searchParams])

  const sendOtp = async () => {
    if (!name.trim()) {
      toast.error('Enter your name')
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          purpose: 'login',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP')
        return
      }

      setOtp('')
      setStep('otp')

      if (data.demoOtp) {
        toast.success(`Demo OTP: ${data.demoOtp}`, {
          duration: 10000,
        })
      } else {
        toast.success(data.message || 'OTP sent successfully')
      }
    } catch (error) {
      console.error('[LOGIN] OTP request failed:', error)
      toast.error('Could not request OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter the complete 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const res = await signIn('phone-otp', {
        phone,
        otp,
        name: name.trim(),
        redirect: false,
      })

      if (res?.ok) {
        toast.success('Welcome to LifePizza!')

        const destination = callbackUrl.startsWith('/admin')
          ? '/'
          : callbackUrl

        router.replace(destination)
        router.refresh()
      } else {
        console.error('[LOGIN] Phone OTP sign-in rejected:', {
          status: res?.status,
          error: res?.error,
        })

        toast.error(
          'Login failed. Request a fresh OTP and try again.'
        )
      }
    } catch (error) {
      console.error('[LOGIN] Sign-in request failed:', error)
      toast.error('Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const emailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminEmail.trim() || !password) {
      toast.error('Enter admin email and password')
      return
    }

    setLoading(true)

    try {
      const res = await signIn('admin-credentials', {
        email: adminEmail.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (res?.ok) {
        toast.success('Welcome back!')

        const destination = callbackUrl.startsWith('/admin')
          ? callbackUrl
          : '/admin/dashboard'

        router.replace(destination)
        router.refresh()
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error) {
      console.error('[LOGIN] Admin sign-in failed:', error)
      toast.error('Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-400 dark:text-gray-500 mt-4">
            Sign in to LifePizza
          </p>
        </div>

        <div className="card p-8 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-green-50 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'phone'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              USER LOGIN
            </button>

            <button
              type="button"
              onClick={() => setMode('email')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'email'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              ADMIN LOGIN
            </button>
          </div>

          {mode === 'phone' ? (
            step === 'phone' ? (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Name *
                  </label>

                  <input
                    className="input"
                    placeholder="Your name"
                    value={name}
                    maxLength={60}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Phone *
                  </label>

                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      className="input pl-9"
                      placeholder="10-digit mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phone}
                      maxLength={10}
                      onChange={(e) =>
                        setPhone(
                          e.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>

                <p className="text-[11px] text-center text-gray-400">
                  Customers sign in with their phone number and OTP.
                  No email required.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Enter the 6-digit code sent to your registered
                  delivery channel for {phone}.
                </p>

                <input
                  className="input text-center text-2xl tracking-[0.4em] font-bold"
                  placeholder="000000"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                />

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {loading ? 'Verifying…' : 'Verify & continue'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                  }}
                  className="text-xs text-green-600 font-semibold w-full"
                >
                  Change number
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={sendOtp}
                  className="text-xs text-gray-500 font-semibold w-full"
                >
                  Request a new OTP
                </button>
              </>
            )
          ) : (
            <form onSubmit={emailLogin} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                  Admin email
                </label>

                <input
                  type="email"
                  className="input"
                  placeholder="Admin email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {loading ? 'Signing in…' : 'Admin sign in'}
              </button>

              <p className="text-[11px] text-center text-gray-400">
                Admin access only. Customers should use phone OTP.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
