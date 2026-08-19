import { Suspense } from 'react'
import VerifyPhoneClient from './VerifyPhoneClient'

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="page-shell min-h-screen flex items-center justify-center">Loading…</div>}>
      <VerifyPhoneClient />
    </Suspense>
  )
}
