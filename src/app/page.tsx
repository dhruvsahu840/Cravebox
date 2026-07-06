import { Navbar } from '@/components/user/Navbar'
import { Hero } from '@/components/user/Hero'
import { MenuSection } from '@/components/user/MenuSection'
import { CartDrawer } from '@/components/user/CartDrawer'
import { OfferStrip, OfferCards } from '@/components/user/OfferBanners'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-green-50">
      <Navbar />
      <OfferStrip />
      <Hero />
      <OfferCards />
      <MenuSection />
      <CartDrawer />
      <footer className="border-t border-green-100 bg-white py-8 text-center mt-8">
        <p className="text-green-900 font-bold text-lg mb-1">🌿 CraveBox</p>
        <p className="text-gray-400 text-sm">Fresh food delivered to your door · Bhopal, MP</p>
        <p className="text-gray-300 text-xs mt-2">📞 +91 98765 43210 · Made with ❤️</p>
      </footer>
    </main>
  )
}
