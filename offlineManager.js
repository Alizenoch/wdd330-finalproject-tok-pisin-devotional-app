// offlineManager.js

const CACHE_NAME = 'devotional-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/language-toggle.js',
  '/notifications.js',
  '/devotionals.json',
  '/audio/2025-10-08_tokPisin.mp3',
  '/audio/2025-10-08_english.mp3',
  '/audio/2025-10-10_tokPisin.mp3',
  '/audio/2025-10-10_english.mp3',
  '/images/logo.png',
  '/offline.html' // Optional fallback page
];

// Cache assets on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() =>
        caches.match('/offline.html') // Optional fallback
      );
    })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});
