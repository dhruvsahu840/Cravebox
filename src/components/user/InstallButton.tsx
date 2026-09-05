"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      console.log("🔥 beforeinstallprompt fired!")

      event.preventDefault()

      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)

    console.log("👀 Waiting for install prompt...")

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const installApp = async () => {
    console.log("Install clicked")
    console.log("Prompt:", deferredPrompt)

    if (!deferredPrompt) {
      console.log("❌ PWA install prompt is not available")
      return
    }

    await deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    console.log("Install:", outcome)

    setDeferredPrompt(null)
  }

  return (
    <button
      onClick={installApp}
      className="flex items-center gap-2"
    >
      <Download size={18} />
      Install App
    </button>
  )
}