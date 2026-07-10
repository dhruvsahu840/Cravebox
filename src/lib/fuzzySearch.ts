export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().trim()
  const t = text.toLowerCase()
  if (!q) return true
  if (t.includes(q)) return true
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim()
  const t = text.toLowerCase()
  if (!q) return 1
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  return fuzzyMatch(q, t) ? 30 : 0
}
