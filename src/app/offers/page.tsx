import { Navbar } from '@/components/user/Navbar'
import { CartDrawer } from '@/components/user/CartDrawer'
import { OfferCards } from '@/components/user/OfferBanners'
import { PageBackground } from '@/components/user/PageBackground'
import { StickyCartBar } from '@/components/user/StickyCartBar'
import { Tag } from 'lucide-react'

export default function OffersPage() {
  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 border-b border-green-100/80 dark:border-gray-800 py-10 px-4 text-center">
        <Tag size={32} className="mx-auto text-green-600 mb-3" />
        <h1 className="text-3xl font-black text-green-900 dark:text-white mb-2">Today&apos;s Offers</h1>
        <p className="text-gray-500 dark:text-gray-400">Save more on every order with these active coupons</p>
      </div>
      <div className="relative z-10">
        <OfferCards />
      </div>
      <CartDrawer />
      <StickyCartBar />
    </div>
  )
}
