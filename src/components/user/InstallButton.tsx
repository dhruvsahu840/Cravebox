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

  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already running as an installed PWA
    const checkInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches

      const iosStandalone =
        (window.navigator as any).standalone === true

      setIsInstalled(standalone || iosStandalone)
    }

    checkInstalled()

    // beforeinstallprompt
    const handleBeforeInstallPrompt = (event: Event) => {
      console.log("🔥 beforeinstallprompt fired")

      event.preventDefault()

      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    // App successfully installed
    const handleAppInstalled = () => {
      console.log("✅ PWA installed")

      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    )

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    )

    console.log("👀 Waiting for install prompt...")

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      )
    }
  }, [])

  const installApp = async () => {
    console.log("Install clicked")
    console.log("Prompt:", deferredPrompt)

    // Already installed
    if (isInstalled) {
      console.log("ℹ️ App is already installed")
      return
    }

    // Browser has not provided install prompt
    if (!deferredPrompt) {
      console.log(
        "❌ Install prompt is not available yet"
      )

      alert(
        "The install option is currently unavailable. Please open this website in Chrome and try again after a few seconds."
      )

      return
    }

    try {
      await deferredPrompt.prompt()

      const { outcome } =
        await deferredPrompt.userChoice

      console.log("Install result:", outcome)

      if (outcome === "accepted") {
        console.log("✅ User accepted installation")
      } else {
        console.log("❌ User dismissed installation")
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.error(
        "❌ Installation failed:",
        error
      )
    }
  }

  // Don't show install button when already installed
  if (isInstalled) {
    return null
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