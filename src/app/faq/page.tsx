import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const FAQS = [
  { q: 'How long does delivery take?', a: 'Most orders arrive in 25–35 minutes across Bhopal. You can track your order live on the order detail page.' },
  { q: 'What is the minimum order value?', a: 'Minimum order is ₹99. Orders above ₹299 get free delivery.' },
  { q: 'Can I pay with cash?', a: 'Yes! We accept Cash on Delivery (COD) as well as online payments via Razorpay (UPI, cards, wallets).' },
  { q: 'How do I cancel my order?', a: 'Go to My Orders and tap Cancel order on any order that is still pending (before the kitchen confirms it). Once confirmed or being prepared, cancellation is no longer available — contact us on WhatsApp for help.' },
  { q: 'Do you offer refunds?', a: 'If there is an issue with your order, contact support within 30 minutes. Refunds for online payments are processed in 5–7 business days.' },
  { q: 'Can I schedule an order for later?', a: 'Yes! At checkout, choose "Schedule for later" and pick your preferred delivery time.' },
  { q: 'How do loyalty points work?', a: 'Earn 10 points for every ₹100 spent. Redeem 100 points for ₹10 off your next order.' },
  { q: 'What are your operating hours?', a: 'We are open daily from 10:00 AM to 11:00 PM.' },
]

export default function FAQPage() {
  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-green-900 dark:text-white mb-2 text-center">FAQ</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Got questions? We&apos;ve got answers.</p>
        <div className="space-y-3">
          {FAQS.map(f => (
            <details key={f.q} className="card group">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-gray-900 dark:text-white list-none">
                {f.q}
                <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-gray-500">
          Still need help? <Link href="/about" className="text-green-600 font-semibold">Contact us</Link>
        </p>
      </div>
    </div>
  )
}
