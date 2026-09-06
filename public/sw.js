const CACHE_NAME = "lifepizza-v1"

self.addEventListener("install", (event) => {
  console.log("Service Worker: installed")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker: activated")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )

  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Don't interfere with API requests
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/")
  ) {
    return
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})