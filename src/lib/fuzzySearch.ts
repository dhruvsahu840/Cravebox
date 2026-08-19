export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().trim()
  const t = text.toLowerCase()
  if (!q) return true
  if (t.includes(q)) return true
  // Match whole words / word starts — avoid loose letter-skip matching (e.g. "pz" → pizza)
  const words = t.split(/[^a-z0-9]+/).filter(Boolean)
  return words.some(w => w.startsWith(q))
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim()
  const t = text.toLowerCase()
  if (!q) return 1
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  const words = t.split(/[^a-z0-9]+/).filter(Boolean)
  if (words.some(w => w.startsWith(q))) return 50
  return 0
}
