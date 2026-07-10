import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import Link from 'next/link'
import { Clock } from 'lucide-react'

const POSTS = [
  { slug: 'best-pizza-bhopal', title: 'Best Pizzas in Bhopal — Our Top Picks', date: 'Jun 2026', emoji: '🍕', excerpt: 'From classic Margherita to loaded veggie supreme — discover what makes CraveBox pizzas special.' },
  { slug: 'late-night-maggi', title: 'Late Night Maggi Cravings? We Got You', date: 'May 2026', emoji: '🍜', excerpt: 'Why our masala maggi is the perfect midnight snack delivered in 30 minutes.' },
  { slug: 'healthy-eating', title: 'Eating Healthy While Ordering In', date: 'Apr 2026', emoji: '🥗', excerpt: 'Tips for choosing veg, lighter options, and balanced meals from our menu.' },
]

export default function BlogPage() {
  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-green-900 dark:text-white mb-2">Food Stories</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Tips, recipes & Bhopal food culture</p>
        <div className="space-y-4">
          {POSTS.map(p => (
            <article key={p.slug} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{p.emoji}</span>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{p.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} /> {p.date}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{p.excerpt}</p>
                  <Link href={`/blog/${p.slug}`} className="text-green-600 text-sm font-bold hover:underline">Read more →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
