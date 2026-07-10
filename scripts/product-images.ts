/** Unsplash food images — hostname already allowed in next.config.js */
export const PRODUCT_IMAGES: Record<string, string> = {
  'margherita-pizza':      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
  'pepperoni-pizza':       'https://images.unsplash.com/photo-1628840042325-39ce4dad5d0a?w=600&q=80',
  'bbq-chicken-pizza':     'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  'paneer-tikka-pizza':    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  'classic-veg-burger':    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  'chicken-zinger-burger': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
  'double-smash-burger':   'https://images.unsplash.com/photo-1550547660-9456982c425e?w=600&q=80',
  'veg-grill-sandwich':    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
  'chicken-club-sandwich': 'https://images.unsplash.com/photo-1619860860774-56e58d16bd21?w=600&q=80',
  'masala-maggi':          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  'egg-maggi':             'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  'cheese-maggi':          'https://images.unsplash.com/photo-1612929734726-6bb6f4e7f0e8?w=600&q=80',
  'cold-coffee':           'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
  'mango-shake':           'https://images.unsplash.com/photo-1623065422902-30a2e2f8c8ec?w=600&q=80',
  'masala-chaas':          'https://images.unsplash.com/photo-1625772299848-391b6a87c7b0?w=600&q=80',
}

export function imageForSlug(slug: string): string[] {
  const url = PRODUCT_IMAGES[slug]
  return url ? [url] : []
}
