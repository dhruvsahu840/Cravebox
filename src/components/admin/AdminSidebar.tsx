'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3, LogOut, Ticket, Gift } from 'lucide-react'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/admin/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { href: '/admin/products',   label: 'Products',   icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/coupons',    label: 'Coupons',    icon: Ticket },
  { href: '/admin/customers',  label: 'Customers',  icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-green-100 min-h-screen flex flex-col shadow-sm">
      <div className="p-5 border-b border-green-100">
        <div className="text-lg font-black text-green-900">🌿 Crave<span className="text-green-600">Box</span></div>
        <div className="text-xs text-gray-400 mt-0.5 font-medium">Admin Panel</div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
              }`}>
              <item.icon size={17} className={active ? 'text-green-600' : 'text-gray-400'} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-green-100 space-y-0.5">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all">
          <BarChart3 size={17} className="text-gray-400" /> View store
        </Link>
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </aside>
  )
}
