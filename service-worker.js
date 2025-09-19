const CACHE_NAME = 'aksharadhara-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/aksharadhara.html',
  '/shuklayajurveda.html',
  '/shruti-sankalanam.html',
  '/telugu.html',
  '/english.html',
  '/sanskrit.html',
  '/hindi.html',
  '/styles.css',
  '/book.css',
  '/commonResources.js',
  '/header.js',
  '/footer.js',
  '/Vedhas.js',
  '/sanskrit.js',
  '/hindi.js',
  '/telugu.js',
  '/english.js',
  '/pwa.js',
  '/manifest.json',
  '/అక్షరధార.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache addAll failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event - respond with cached resources or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest, {redirect: 'follow'})
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return networkResponse;
          })
          .catch(() => {
            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Push notification event handler - show notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Update from AksharaDhara';
  const options = {
    body: data.body || 'Check out the latest features in the app.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: data.url || '/',
    actions: [{ action: 'open', title: 'Open App' }]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler - focus or open the app window
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});
