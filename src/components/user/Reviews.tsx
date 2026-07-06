'use client'
import { useEffect, useState } from 'react'
import { Star, Loader2, Send } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ReviewFormProps {
  productId: string
  orderId:   string
  onSubmit?: () => void
}

export function ReviewForm({ productId, orderId, onSubmit }: ReviewFormProps) {
  const { data: session } = useSession()
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving]   = useState(false)

  if (!session) return null

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return }
    setSaving(true)
    const res  = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, orderId, rating, comment }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      toast.success('Review submitted! Thanks 🙏')
      onSubmit?.()
    } else {
      toast.error(data.error)
    }
  }

  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
      <p className="font-semibold text-green-900 text-sm">Rate this item</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
            <Star size={24} className={`transition-colors ${(hover || rating) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-gray-500 self-center">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</span>}
      </div>
      <textarea
        className="input text-sm resize-none h-20"
        placeholder="Tell others what you thought (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button onClick={submit} disabled={saving || !rating} className="btn-primary text-sm flex items-center gap-2">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Submit review
      </button>
    </div>
  )
}

interface ReviewsListProps { productId: string }

export function ReviewsList({ productId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews?product=${productId}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews || []); setLoading(false) })
  }, [productId])

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="animate-spin text-green-500" size={20} /></div>
  if (!reviews.length) return <p className="text-sm text-gray-400 text-center py-4">No reviews yet. Be the first!</p>

  return (
    <div className="space-y-4">
      {reviews.map((r: any) => (
        <div key={r._id} className="bg-white border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
              {r.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{r.user?.name}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={12} className={r.rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
            </div>
            <span className="ml-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
          {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
        </div>
      ))}
    </div>
  )
}
