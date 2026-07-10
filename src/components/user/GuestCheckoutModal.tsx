'use client'
import { useEffect, useState } from 'react'
import { Phone, Loader2, X } from 'lucide-react'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function GuestCheckoutModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    if (!name || phone.length < 10) { toast.error('Enter name and valid phone'); return }
    setLoading(true)
    const res = await fetch('/api/guest/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, name }) })
    const d = await res.json()
    setLoading(false)
    if (res.ok) { setSentOtp(d.otp); setStep('otp'); toast.success(`OTP sent! Demo code: ${d.otp}`) }
    else toast.error(d.error)
  }

  const verify = async () => {
    if (otp !== sentOtp) { toast.error('Invalid OTP'); return }
    setLoading(true)
    const email = `guest_${phone}@cravebox.local`
    const password = `guest_${phone}`
    const login = await signIn('credentials', { email: email.toLowerCase(), password, redirect: false })
    setLoading(false)
    if (login?.ok) { toast.success('Welcome!'); onSuccess(); onClose() }
    else toast.error('Could not sign in. Try registering first.')
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-[61] card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Quick checkout</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {step === 'phone' ? (
          <div className="space-y-3">
            <input className="input text-sm" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input text-sm pl-9" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            <button onClick={sendOtp} disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Enter the 4-digit code sent to {phone}</p>
            <input className="input text-sm text-center text-2xl tracking-[0.5em] font-bold" placeholder="----" maxLength={4} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
            <button onClick={verify} disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Verify & continue'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
