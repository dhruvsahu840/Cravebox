'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Package, Menu, X, Tag } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
 const items = useCart(s => s.items)
const hydrated = useCart(s => s.hydrated)

const totalItems = hydrated
  ? items.reduce((sum, item) => sum + item.qty, 0)
  : 0
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-green-900">
          <span>🌿</span>
          <span>Crave<span className="text-green-600">Box</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="btn-ghost text-sm flex items-center gap-1.5">🍽️ Menu</Link>
          <Link href="/offers" className="btn-ghost text-sm flex items-center gap-1.5"><Tag size={15}/> Offers</Link>
          <Link href="/orders" className="btn-ghost text-sm flex items-center gap-1.5"><Package size={15}/> Orders</Link>
          {session ? (
            <>
              {session.user.role === 'admin' && (
                <Link href="/admin" className="btn-ghost text-sm text-green-600 font-semibold">Admin</Link>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2 border-l border-gray-100 ml-1">
                <User size={15} className="text-green-600"/>
                <span className="max-w-[100px] truncate font-medium">{session.user.name?.split(' ')[0]}</span>
              </div>
              <button onClick={() => signOut()} className="btn-ghost text-gray-400 hover:text-red-500 p-2">
                <LogOut size={16}/>
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary text-sm ml-2">Sign in</Link>
          )}
          <button onClick={() => document.dispatchEvent(new Event('open-cart'))}
            className="relative btn-primary flex items-center gap-2 py-2 px-4 ml-1">
            <ShoppingCart size={17}/>
            <span className="hidden sm:inline text-sm">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-900 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => document.dispatchEvent(new Event('open-cart'))}
            className="relative btn-primary flex items-center gap-1.5 py-2 px-3 text-sm">
            <ShoppingCart size={16}/>
            {totalItems > 0 && (
              <span className="bg-green-900 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{totalItems}</span>
            )}
          </button>
          <button onClick={() => setOpen(!open)} className="btn-ghost p-2">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-green-100 p-3 space-y-1">
          {[
            { href: '/', label: '🍽️ Menu' },
            { href: '/offers', label: '🏷️ Offers' },
            { href: '/orders', label: '📦 My Orders' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block btn-ghost py-2.5 text-sm" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          {session?.user.role === 'admin' && (
            <Link href="/admin" className="block btn-ghost py-2.5 text-sm text-green-600 font-semibold" onClick={() => setOpen(false)}>⚙️ Admin Panel</Link>
          )}
          {session ? (
            <button onClick={() => { signOut(); setOpen(false) }} className="block btn-ghost py-2.5 text-sm text-red-500 w-full text-left">Sign out</button>
          ) : (
            <Link href="/auth/login" className="block btn-primary text-center mt-2" onClick={() => setOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </nav>
  )
}
