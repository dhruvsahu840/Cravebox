'use client'
import { MessageCircle } from 'lucide-react'
import { STORE } from '@/lib/config'

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${STORE.whatsapp}?text=Hi%20CraveBox%2C%20I%20need%20help%20with%20my%20order`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  )
}
