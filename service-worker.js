// Service Worker pour la mise en cache des ressources de l'application

const cacheName = 'gao-0.8';
const cacheFiles = [
  'index.html',
  'manifest.json',
  'assets/icon.svg',
  'assets/icon-48.png',
  'assets/icon-96.png',
  'assets/icon-144.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/A2.mp3',
  'assets/A3.mp3',
  'assets/B3.mp3',
  'assets/D3.mp3',
  'assets/E2.mp3',
  'js/Tone.js',
  'js/Tone.js.map'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(cacheFiles);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (thisCacheName) {
          if (thisCacheName !== cacheName) {
            return caches.delete(thisCacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
