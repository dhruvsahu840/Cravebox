'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { AdminOrderNotifier } from './AdminOrderNotifier'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-shell flex min-h-screen bg-green-50 text-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AdminOrderNotifier />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-green-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-green-50 text-gray-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="text-base font-black text-green-900">
            🌿 Crave<span className="text-green-600">Box</span>
            <span className="text-xs font-medium text-gray-400 ml-2">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
