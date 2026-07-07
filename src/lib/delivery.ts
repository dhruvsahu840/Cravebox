export function getDeliveryEstimate(itemCount: number): { min: number; max: number; label: string } {
  const base = 25
  const extra = Math.min(itemCount * 2, 15)
  const min = base + extra
  const max = min + 10
  return { min, max, label: `${min}–${max} mins` }
}

export function formatEta(date?: string | Date | null): string | null {
  if (!date) return null
  const mins = Math.max(0, Math.round((new Date(date).getTime() - Date.now()) / 60000))
  if (mins <= 0) return 'Arriving soon'
  return `~${mins} min`
}
