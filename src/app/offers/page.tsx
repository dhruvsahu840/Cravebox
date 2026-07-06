import { Navbar } from '@/components/user/Navbar'
import { CartDrawer } from '@/components/user/CartDrawer'
import { OfferCards } from '@/components/user/OfferBanners'
import { Tag } from 'lucide-react'

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-green-50">
      <Navbar />
      <div className="bg-gradient-to-b from-green-50 to-white border-b border-green-100 py-10 px-4 text-center">
        <Tag size={32} className="mx-auto text-green-600 mb-3" />
        <h1 className="text-3xl font-black text-green-900 mb-2">Today's Offers</h1>
        <p className="text-gray-500">Save more on every order with these active coupons</p>
      </div>
      <OfferCards />
      <CartDrawer />
    </main>
  )
}
