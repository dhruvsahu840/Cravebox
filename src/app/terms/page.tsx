import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { BottomNav } from '@/components/user/BottomNav'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="page-shell min-h-screen pb-24 md:pb-10">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="text-green-600 text-sm font-bold">← Back</Link>
        <h1 className="text-3xl font-black text-green-900 mt-4 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-6">Last updated: July 2026</p>
        <div className="text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed">
          <p>
            By ordering from Lifepizza you agree to these terms. Please read them carefully.
          </p>
          <h2 className="text-lg font-bold text-green-900">Orders & pricing</h2>
          <p>
            Prices shown at checkout are final for that order (including size options, tax, and delivery).
            We may refuse or cancel orders in case of unavailability, store closure, or suspected fraud.
          </p>
          <h2 className="text-lg font-bold text-green-900">Payment</h2>
          <p>
            You may pay online via Razorpay or choose Cash on Delivery where available. Online orders are
            confirmed after successful payment.
          </p>
          <h2 className="text-lg font-bold text-green-900">Delivery</h2>
          <p>
            Estimated delivery times are approximate. Delays can happen due to traffic, weather, or high demand.
            Please provide a correct delivery address and reachable phone number.
          </p>
          <h2 className="text-lg font-bold text-green-900">Cancellations & refunds</h2>
          <p>
            You may request cancellation before the kitchen starts preparing. Refunds for paid orders are
            processed through the original payment method as per our support policy.
          </p>
          <h2 className="text-lg font-bold text-green-900">Accounts</h2>
          <p>
            You are responsible for keeping your login details safe. Guest checkout via OTP is for ordering
            convenience and may create a limited account linked to your phone.
          </p>
          <h2 className="text-lg font-bold text-green-900">Contact</h2>
          <p>
            Questions? Reach us at <strong>hello@lifepizza.in</strong> or via WhatsApp on the website.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
