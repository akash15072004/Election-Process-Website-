const CACHE_NAME = 'voteguide-ai-v10';
const ASSETS = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/pages.css',
  '/js/app.js',
  '/js/router.js',
  '/js/utils.js',
  '/js/auth.js',
  '/js/data.js',
  '/js/badges.js',
  '/js/pages-home.js',
  '/js/pages-features.js',
  '/js/three-bg.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  // Ignore API calls, external resources, and Firebase auth requests
  if (event.request.url.includes('googleapis.com') || 
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('identitytoolkit') ||
      event.request.url.includes('google.com')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache, but update cache in background (Stale-While-Revalidate)
        event.waitUntil(
          fetch(event.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }).catch(() => {}) // Ignore fetch errors in background update
        );
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // If network fails and it's a navigation request, maybe return a fallback
      });
    })
  );
});
