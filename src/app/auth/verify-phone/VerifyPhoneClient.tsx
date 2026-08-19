'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/shared/Logo'

export default function VerifyPhoneClient() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
      return
    }
    if (status === 'authenticated' && session?.user?.phoneVerified) {
      router.replace(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  const sendOtp = async () => {
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit phone'); return }
    setLoading(true)
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'link_phone', name: session?.user?.name }),
    })
    const d = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(d.error || 'Failed to send OTP'); return }
    setStep('otp')
    if (d.demoOtp) toast.success(`Demo OTP: ${d.demoOtp}`, { duration: 10000 })
    else toast.success(d.message || 'OTP sent')
  }

  const verify = async () => {
    if (otp.length < 4) { toast.error('Enter OTP'); return }
    setLoading(true)
    const res = await fetch('/api/auth/otp/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name: session?.user?.name }),
    })
    const d = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(d.error || 'Verification failed'); return }
    await update({ phone: d.user.phone, phoneVerified: true })
    toast.success('Phone verified!')
    router.replace(callbackUrl)
    router.refresh()
  }

  if (status === 'loading') {
    return <div className="page-shell min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>
  }

  return (
    <div className="page-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <h1 className="text-xl font-black text-green-900 mt-4">Verify your phone</h1>
          <p className="text-sm text-gray-500 mt-2">
            Google sign-in is done. Add your WhatsApp number to place orders.
          </p>
        </div>
        <div className="card p-6 space-y-4">
          {step === 'phone' ? (
            <>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <button onClick={sendOtp} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Send WhatsApp OTP
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Code sent to {phone}</p>
              <input
                className="input text-center text-2xl tracking-[0.4em] font-bold"
                maxLength={4}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              />
              <button onClick={verify} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Verify phone
              </button>
              <button type="button" className="text-xs text-green-600 font-semibold w-full" onClick={() => setStep('phone')}>
                Change number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
