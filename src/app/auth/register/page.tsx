'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Password signup removed — redirect to phone OTP login. */
export default function RegisterPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/auth/login')
  }, [router])
  return (
    <div className="page-shell min-h-screen flex items-center justify-center text-green-700 text-sm">
      Redirecting to sign in…
    </div>
  )
}
