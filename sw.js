const CACHE_NAME = 'aksharadhara-v2'; // ← Change version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/aksharadhara.html',
  '/shuklayajurveda.html',      // ← Exact match from your navigation
  '/shruti-sankalanam.html',
  '/telugu.html',               // ← Exact match from your navigation
  '/english.html',
  '/styles.css',
  '/book.css',
  '/header.js',
  '/footer.js',
  '/Vedhas.js',
  '/pwa.js',
  '/manifest.json',
  '/అక్షరధార.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache addAll failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch with proper redirect handling
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest, {
          redirect: 'follow'
        }).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
