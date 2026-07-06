'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingBag, Users, TrendingUp, Clock, ChefHat, Bike, CheckCircle } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const statusIcon: any = { pending: Clock, confirmed: CheckCircle, preparing: ChefHat, out_for_delivery: Bike, delivered: CheckCircle }
  const statusColor: any = { pending: 'text-yellow-600', confirmed: 'text-blue-600', preparing: 'text-orange-600', out_for_delivery: 'text-purple-600', delivered: 'text-green-600', cancelled: 'text-red-600' }

  return (
    <div className="flex min-h-screen bg-green-50">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black text-green-900 mb-6">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-green-50" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Today's orders", value: data.stats.todayOrders,  icon: ShoppingBag, color: 'text-green-600',  bg: 'bg-green-50' },
                { label: 'Total revenue',  value: `₹${data.stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Active orders',  value: data.stats.pendingOrders, icon: Clock,        color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Total users',    value: data.stats.totalUsers,    icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50' },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{s.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-6 mb-6">
              <h2 className="font-bold text-gray-700 mb-4">Revenue — last 7 days</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.revenueByDay}>
                  <XAxis dataKey="_id" stroke="#d1d5db" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#d1d5db" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-700">Recent orders</h2>
                <Link href="/admin/orders" className="text-green-600 text-sm hover:underline font-medium">View all →</Link>
              </div>
              <div className="space-y-2">
                {data.recentOrders.map((order: any) => {
                  const Icon  = statusIcon[order.status] || Clock
                  const color = statusColor[order.status] || 'text-gray-400'
                  return (
                    <Link key={order._id} href={`/admin/orders/${order._id}`}
                      className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={color} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">#{order.orderNumber}</p>
                          <p className="text-gray-400 text-xs">{order.user?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{order.total}</p>
                        <p className="text-gray-300 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
