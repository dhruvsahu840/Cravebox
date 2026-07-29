import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { BottomNav } from '@/components/user/BottomNav'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="page-shell min-h-screen pb-24 md:pb-10">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 prose prose-green">
        <Link href="/" className="text-green-600 text-sm font-bold no-underline">← Back</Link>
        <h1 className="text-3xl font-black text-green-900 mt-4 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: July 2026</p>
        <div className="text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed mt-6">
          <p>
            Lifepizza (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what data we collect when you
            order food through our website and how we use it.
          </p>
          <h2 className="text-lg font-bold text-green-900">Information we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account details: name, email, phone number</li>
            <li>Delivery address and order history</li>
            <li>Payment status (we do not store full card details — payments are processed by Razorpay)</li>
            <li>Device/browser basics needed to run the site securely</li>
          </ul>
          <h2 className="text-lg font-bold text-green-900">How we use it</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To place, prepare, and deliver your orders</li>
            <li>To send order updates and support messages</li>
            <li>To improve our menu and service</li>
            <li>To prevent fraud and abuse</li>
          </ul>
          <h2 className="text-lg font-bold text-green-900">Sharing</h2>
          <p>
            We share order details with delivery partners when needed to complete delivery, and with payment
            providers (e.g. Razorpay) to process payments. We do not sell your personal data.
          </p>
          <h2 className="text-lg font-bold text-green-900">Contact</h2>
          <p>
            For privacy requests, email <strong>hello@lifepizza.in</strong> or message us on WhatsApp from the site.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
