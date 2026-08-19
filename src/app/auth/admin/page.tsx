import { redirect } from 'next/navigation'

/** Separate admin login removed — use the main login page. */
export default function AdminLoginRedirect({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; error?: string }
}) {
  const params = new URLSearchParams()
  if (searchParams?.callbackUrl) params.set('callbackUrl', searchParams.callbackUrl)
  if (searchParams?.error) params.set('error', searchParams.error)
  const q = params.toString()
  redirect(`/auth/login${q ? `?${q}` : ''}`)
}
