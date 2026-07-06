// ═══════════════════════════════════════════════════════════════
// BuyTripsNow — PWA Service Worker (Pure JavaScript)
// Cache-first strategies supporting offline travel itinerary access.
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = "buytripsnow-cache-v1";

// Cache core assets & offline pages
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/images/buytripsnow_icon.png",
];

// Install: Cache core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("PWA SW: Pre-caching core assets.");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("PWA SW: Deleting outdated cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache, fallback to network & dynamically cache itineraries
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Focus caching strategy on itinerary pages and itinerary API requests
  const isItineraryApi = requestUrl.pathname.includes("/api/itinerary");
  const isPortalView = requestUrl.pathname.includes("/portal/");

  if (isItineraryApi || isPortalView) {
    // Network-first, fallback-to-cache (always show freshest data, but show cached details if offline in forests/mountains)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, clone and cache it dynamically
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log("PWA SW: Device is offline. Serving cached itinerary data.");
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return a mock offline alert if not cached
            return new Response(
              JSON.stringify({ error: "Itinerary is unavailable offline. Re-connect to internet." }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
  } else {
    // Standard Cache-first (or cache-with-network-fallback) for static images, css, scripts
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Cache static images dynamically
          if (
            response.status === 200 &&
            (requestUrl.pathname.endsWith(".png") ||
              requestUrl.pathname.endsWith(".css") ||
              requestUrl.pathname.endsWith(".js") ||
              requestUrl.pathname.endsWith(".svg"))
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});
