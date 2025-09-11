const CACHE_NAME = 'aksharadhara-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/aksharadhara.html',
  '/Shukla.html',

  '/shruti-sankalanam.html',
  '/Tel.html',
  '/english.html',
  '/styles.css', 
  '/book.css',
  '/header.js',
  '/footer.js',
  '/Vedhas.js',
  '/అక్షరధార.png',
 
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
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

// Fetch - Cache First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
