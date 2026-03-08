// Service Worker for PWA - Network-First Strategy
const CACHE_NAME = 'finance-tracker-v2'; // Bumped version to force cache refresh
const urlsToCache = [
  '/manifest.json',
];

// Install event - cache only static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network-first for HTML/API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for HTML and API calls
  if (
    request.method === 'GET' && 
    (request.headers.get('accept')?.includes('text/html') ||
     url.pathname.startsWith('/api/'))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first for static assets (images, fonts, etc.)
  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );
});
