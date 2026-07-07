import Link from 'next/link'
import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { Logo } from '@/components/shared/Logo'

export default function NotFound() {
  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <p className="text-8xl font-black text-green-200 dark:text-green-900 mb-4">404</p>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          Looks like this dish isn&apos;t on the menu. Let&apos;s get you back to something delicious.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="btn-primary">Back to menu</Link>
          <Link href="/orders" className="btn-secondary">My orders</Link>
        </div>
        <div className="mt-12 opacity-60">
          <Logo size="lg" href="/" />
        </div>
      </div>
    </div>
  )
}
