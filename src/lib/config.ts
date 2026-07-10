export const STORE = {
  name: 'CraveBox',
  phone: '+919876543210',
  whatsapp: '919876543210',
  city: 'Bhopal',
  freeDeliveryMin: 299,
  minOrder: 99,
  deliveryFee: 40,
  taxRate: 0.05,
  openHour: 10,
  closeHour: 23,
  loyaltyPointsPer100: 10,
  firstOrderCoupon: 'WELCOME50',
}

export function isStoreOpen(): boolean {
  const now = new Date()
  const h = now.getHours()
  return h >= STORE.openHour && h < STORE.closeHour
}

export function storeStatusLabel(): { open: boolean; label: string; sub: string } {
  const open = isStoreOpen()
  if (open) return { open: true, label: 'Open now', sub: `Closes at ${STORE.closeHour}:00` }
  const now = new Date()
  const h = now.getHours()
  if (h < STORE.openHour) return { open: false, label: 'Closed', sub: `Opens at ${STORE.openHour}:00 AM` }
  return { open: false, label: 'Closed', sub: `Opens tomorrow at ${STORE.openHour}:00 AM` }
}
