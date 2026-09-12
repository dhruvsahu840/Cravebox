import { Navbar } from '@/components/user/Navbar'
import { Hero } from '@/components/user/Hero'
import { StickyMenuSearch } from '@/components/user/StickyMenuSearch'
import { MenuSection } from '@/components/user/MenuSection'
import { CartDrawer } from '@/components/user/CartDrawer'
import { OfferCards } from '@/components/user/OfferBanners'
import { StickyCartBar } from '@/components/user/StickyCartBar'
import { PageBackground } from '@/components/user/PageBackground'
import { StoreStatus } from '@/components/user/StoreStatus'
import { RepeatOrderBanner } from '@/components/user/RepeatOrderBanner'
import { TrendingSection } from '@/components/user/TrendingSection'
import { FlashDealBanner } from '@/components/user/FlashDealBanner'
import { StoriesStrip } from '@/components/user/StoriesStrip'
import { TrustBadges } from '@/components/user/TrustBadges'
import { BottomNav } from '@/components/user/BottomNav'
import { WhatsAppButton } from '@/components/user/WhatsAppButton'
import { PWAInstallPrompt } from '@/components/user/PWAInstallPrompt'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="page-shell">
      <PageBackground />
      <Navbar />
      <StickyMenuSearch />
      <div className="relative z-10 flex justify-center py-2">
        <StoreStatus />
      </div>
      <Hero />
      <RepeatOrderBanner />
      <StoriesStrip />
      <FlashDealBanner />
      <TrendingSection />
      <TrustBadges />
      <div className="relative z-10 flex flex-col">
        <div className="order-1 lg:order-2">
          <MenuSection />
        </div>
        <div className="order-2 lg:order-1">
          <OfferCards />
        </div>
        <footer className="order-3 mt-8 lg:mt-12 border-t border-green-200/50 dark:border-gray-800 bg-gradient-to-b from-white/60 to-green-50/80 dark:from-gray-900/60 dark:to-gray-950/80 backdrop-blur-sm py-10 text-center pb-28 md:pb-10">
          <p className="text-green-900 dark:text-green-100 font-extrabold text-xl mb-1 tracking-tight">
            🍕 Life<span className="text-green-600">pizza</span>
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Fresh food delivered to your door · bijawar, MP</p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-400">
            <Link href="/about" className="hover:text-green-600">About</Link>
            <Link href="/offers" className="hover:text-green-600">Offers</Link>
            <Link href="/faq" className="hover:text-green-600">FAQ</Link>
            <Link href="/blog" className="hover:text-green-600">Blog</Link>
            <Link href="/privacy" className="hover:text-green-600">Privacy</Link>
            <Link href="/terms" className="hover:text-green-600">Terms</Link>
            <Link href="/profile" className="hover:text-green-600">Profile</Link>
          </div>
          <p className="text-gray-400 text-xs mt-3">📞 9302642854 · Made with ❤️ in India</p>
        </footer>
      </div>
      <CartDrawer />
      <StickyCartBar />
      <BottomNav />
      <WhatsAppButton />
      <PWAInstallPrompt />
    </div>
  )
}
