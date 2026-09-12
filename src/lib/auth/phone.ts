/** Normalize to 10-digit Indian mobile (last 10 digits). */
export function normalizePhone(phone: string): string {
  return String(phone || '').replace(/\D/g, '').slice(-10)
}

export function isValidIndianPhone(phone: string): boolean {
  const p = normalizePhone(phone)
  return /^[6-9]\d{9}$/.test(p)
}

/** Formats number to full E.164 string for Twilio (+918602355924) */
export function toE164India(phone: string): string {
  const digits = normalizePhone(phone)
  return `+91${digits}`
}