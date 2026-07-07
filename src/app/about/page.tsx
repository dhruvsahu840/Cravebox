import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 dark:text-white mb-3">
            About <span className="text-green-600">CraveBox</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Fresh food, fast delivery — made with love in Bhopal</p>
        </div>

        <div className="card p-6 sm:p-8 mb-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            CraveBox started with a simple idea: great food shouldn&apos;t take forever. We deliver piping-hot pizzas, burgers,
            sandwiches, and maggi straight to your door in under 30 minutes.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Every dish is prepared fresh when you order. We use quality ingredients, secure payments, and live order tracking
            so you always know where your food is.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Clock, title: '30-min delivery', desc: 'Fast & reliable across Bhopal' },
            { icon: Heart, title: 'Made fresh', desc: 'Prepared after you order' },
            { icon: MapPin, title: 'Bhopal, MP', desc: 'Serving the city we love' },
            { icon: Phone, title: 'Always reachable', desc: '+91 98765 43210' },
          ].map(item => (
            <div key={item.title} className="card p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                <item.icon size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 text-center">
          <Mail size={20} className="text-green-600 mx-auto mb-2" />
          <p className="font-bold text-gray-900 dark:text-white mb-1">Get in touch</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">hello@cravebox.in · Open 10 AM – 11 PM daily</p>
          <Link href="/" className="btn-primary inline-block">Order now</Link>
        </div>
      </div>
    </div>
  )
}
