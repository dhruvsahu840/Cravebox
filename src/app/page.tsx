import { Navbar } from '@/components/user/Navbar'
import { Hero } from '@/components/user/Hero'
import { MenuSection } from '@/components/user/MenuSection'
import { CartDrawer } from '@/components/user/CartDrawer'
import { OfferStrip, OfferCards } from '@/components/user/OfferBanners'
import { StickyCartBar } from '@/components/user/StickyCartBar'
import { PageBackground } from '@/components/user/PageBackground'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="page-shell">
      <PageBackground />
      <Navbar />
      <OfferStrip />
      <Hero />
      <div className="relative z-10 flex flex-col">
        {/* Menu first on mobile so users reach products faster */}
        <div className="order-1 lg:order-2">
          <MenuSection />
        </div>
        <div className="order-2 lg:order-1">
          <OfferCards />
        </div>
        <footer className="order-3 mt-8 lg:mt-12 border-t border-green-200/50 dark:border-gray-800 bg-gradient-to-b from-white/60 to-green-50/80 dark:from-gray-900/60 dark:to-gray-950/80 backdrop-blur-sm py-10 text-center pb-24 md:pb-10">
          <p className="text-green-900 dark:text-green-100 font-extrabold text-xl mb-1 tracking-tight">
            🌿 Crave<span className="text-green-600">Box</span>
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Fresh food delivered to your door · Bhopal, MP</p>
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
            <Link href="/about" className="hover:text-green-600">About</Link>
            <Link href="/offers" className="hover:text-green-600">Offers</Link>
            <Link href="/profile" className="hover:text-green-600">Profile</Link>
          </div>
          <p className="text-gray-400 text-xs mt-3">📞 +91 98765 43210 · Made with ❤️ in India</p>
        </footer>
      </div>
      <CartDrawer />
      <StickyCartBar />
    </div>
  )
}
