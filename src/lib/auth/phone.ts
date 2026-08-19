/** Normalize to 10-digit Indian mobile (last 10 digits). */
export function normalizePhone(phone: string): string {
  return String(phone || '').replace(/\D/g, '').slice(-10)
}

export function isValidIndianPhone(phone: string): boolean {
  const p = normalizePhone(phone)
  return /^[6-9]\d{9}$/.test(p)
}

export function toE164India(phone: string): string {
  return `+91${normalizePhone(phone)}`
}
