import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="page-shell min-h-screen flex items-center justify-center text-green-700">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
