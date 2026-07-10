'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/user/Navbar'
import { PageBackground } from '@/components/user/PageBackground'
import { CartDrawer } from '@/components/user/CartDrawer'
import { StickyCartBar } from '@/components/user/StickyCartBar'
import { BottomNav } from '@/components/user/BottomNav'
import { Plus } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const addItem = useCart(s => s.addItem)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      const cat = d.categories?.find((c: any) => c.slug === params.slug)
      setCategory(cat)
      if (cat) fetch(`/api/products?category=${cat._id}&limit=40`).then(r => r.json()).then(pd => setProducts(pd.products || []))
    })
  }, [params.slug])

  return (
    <div className="page-shell min-h-screen pb-24 md:pb-10">
      <PageBackground />
      <Navbar />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="text-green-600 text-sm font-bold mb-4 inline-block">← Back to menu</Link>
        <h1 className="text-3xl font-extrabold text-green-900 dark:text-white mb-6 capitalize">
          {category?.name || params.slug.replace(/-/g, ' ')}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p._id} className="card overflow-hidden">
              <div className="relative h-40 bg-green-50">
                {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-green-600 font-black">₹{p.discountedPrice || p.price}</p>
                </div>
                <button onClick={() => { addItem({ _id: p._id, name: p.name, price: p.discountedPrice || p.price, image: p.images?.[0] || '' }); toast.success('Added!') }}
                  className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CartDrawer />
      <StickyCartBar />
      <BottomNav />
    </div>
  )
}
