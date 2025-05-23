const CACHE_NAME = 'sleep-disruptor-v2';
const ASSETS = [
  '/disruptor/',
  '/disruptor/index.html',
  '/disruptor/manifest.webmanifest',
  '/disruptor/icon-192.png',
  '/disruptor/icon-512.png',
  '/disruptor/splash.png',
  'https://cdn.jsdelivr.net/npm/wake-lock@0.2.0/dist/wakelock.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
