'use client'

import React, { useEffect, useState } from 'react'

// Convert base64 VAPID key to ArrayBuffer
function urlBase64ToArrayBuffer(
  base64String: string
): ArrayBuffer {
  const padding = '='.repeat(
    (4 - (base64String.length % 4)) % 4
  )

  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)

  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return buffer
}

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [mounted, setMounted] =
    useState(false)

  // ---------------------------------------------------------
  // Check existing browser subscription
  // ---------------------------------------------------------
  useEffect(() => {
    setMounted(true)

    const checkSubscription = async () => {
      try {
        if (
          !('serviceWorker' in navigator) ||
          !('PushManager' in window)
        ) {
          return
        }

        const registration =
          await navigator.serviceWorker.ready

        const subscription =
          await registration.pushManager.getSubscription()

        if (subscription) {
          setIsSubscribed(true)
        }
      } catch (error) {
        console.error(
          '[Push] Failed to check subscription:',
          error
        )
      }
    }

    checkSubscription()
  }, [])

  // ---------------------------------------------------------
  // Subscribe to Web Push
  // ---------------------------------------------------------
  const handleSubscribe = async () => {
    if (loading || isSubscribed) {
      return
    }

    setLoading(true)

    try {
      // -----------------------------------------------------
      // 1. Check browser support
      // -----------------------------------------------------
      if (
        !('serviceWorker' in navigator)
      ) {
        throw new Error(
          'Service workers are not supported in this browser.'
        )
      }

      if (
        !('PushManager' in window)
      ) {
        throw new Error(
          'Push notifications are not supported in this browser.'
        )
      }

      if (
        !('Notification' in window)
      ) {
        throw new Error(
          'Browser notifications are not supported.'
        )
      }

      // -----------------------------------------------------
      // 2. Check VAPID public key
      // -----------------------------------------------------
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        throw new Error(
          'VAPID public key is missing.'
        )
      }

      // -----------------------------------------------------
      // 3. Ask for notification permission
      // -----------------------------------------------------
      const permission =
        await Notification.requestPermission()

      if (permission !== 'granted') {
        throw new Error(
          'Notification permission was not granted.'
        )
      }

      // -----------------------------------------------------
      // 4. Register service worker
      // -----------------------------------------------------
      const registration =
        await navigator.serviceWorker.register(
          '/sw.js'
        )

      await navigator.serviceWorker.ready

      // -----------------------------------------------------
      // 5. Get existing subscription
      // -----------------------------------------------------
      let subscription =
        await registration.pushManager.getSubscription()

      // -----------------------------------------------------
      // 6. Create subscription if necessary
      // -----------------------------------------------------
      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToArrayBuffer(
                vapidPublicKey
              ),
          })
      }

      // -----------------------------------------------------
      // 7. Save subscription to MongoDB
      // -----------------------------------------------------
      const response = await fetch(
        '/api/subscribe',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify(
            subscription.toJSON()
          ),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to save push subscription.'
        )
      }

      // -----------------------------------------------------
      // 8. Update UI
      // -----------------------------------------------------
      setIsSubscribed(true)

      alert(
        '🔔 LifePizza order notifications are enabled!'
      )
    } catch (error: any) {
      console.error(
        '[Push] Subscription error:',
        error
      )

      alert(
        error?.message ||
          'Something went wrong while enabling notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={
        isSubscribed || loading
      }
      className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {loading
        ? 'Connecting...'
        : isSubscribed
        ? '🔔 Notifications Enabled'
        : '🍕 Enable Order Alerts'}
    </button>
  )
}