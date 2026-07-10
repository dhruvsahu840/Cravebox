import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import Link from 'next/link'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <div className="page-shell min-h-screen">
      <PageBackground />
      <Navbar />
      <article className="relative z-10 max-w-2xl mx-auto px-4 py-10 prose dark:prose-invert">
        <Link href="/blog" className="text-green-600 text-sm font-bold no-underline">← Back to blog</Link>
        <h1 className="text-3xl font-extrabold text-green-900 dark:text-white mt-4">{title}</h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
          Welcome to CraveBox food stories! We&apos;re passionate about bringing the best food experiences to Bhopal.
          Stay tuned for more recipes, tips, and local food guides. In the meantime,{' '}
          <Link href="/" className="text-green-600 font-semibold">order something delicious</Link>!
        </p>
      </article>
    </div>
  )
}
