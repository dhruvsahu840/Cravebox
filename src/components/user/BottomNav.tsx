'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, Package, User } from 'lucide-react'

const NAV = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/#menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const path = usePathname()
  if (path.startsWith('/admin') || path.startsWith('/auth')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-green-100 dark:border-gray-800 safe-area-pb">
      <div className="flex justify-around py-2">
        {NAV.map(n => {
          const active = n.href === '/' ? path === '/' : path.startsWith(n.href.replace('/#menu', ''))
          return (
            <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${active ? 'text-green-600' : 'text-gray-400'}`}>
              <n.icon size={20} />
              {n.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
