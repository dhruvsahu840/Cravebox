'use client'
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      if (!localStorage.getItem('pwa-dismissed')) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-20 md:w-80 z-40 card p-4 shadow-2xl animate-fade-up">
      <button onClick={() => { setShow(false); localStorage.setItem('pwa-dismissed', '1') }} className="absolute top-2 right-2 text-gray-400"><X size={16} /></button>
      <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Install CraveBox</p>
      <p className="text-xs text-gray-500 mb-3">Add to home screen for app-like experience</p>
      <button onClick={install} className="btn-primary w-full text-sm flex items-center justify-center gap-2 py-2">
        <Download size={16} /> Install app
      </button>
    </div>
  )
}
