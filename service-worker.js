// Service Worker pour la mise en cache des ressources de l'application

const cacheName = 'gao-1.2';

// Seuls les assets statiques lourds sont mis en cache (audio, images)
const cacheFiles = [
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
];

// Extensions servies systématiquement depuis le réseau (jamais depuis le cache)
const noCacheExtensions = ['.html', '.js', '.css', '.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(cacheFiles);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  const noCache = noCacheExtensions.some(ext => url.pathname.endsWith(ext));

  if (noCache) {
    // Toujours réseau pour HTML / JS / CSS / JSON
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets statiques : cache en priorité, réseau en fallback
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
    }).then(function () {
      return self.clients.matchAll({ type: 'window' }).then(function (clients) {
        clients.forEach(function (client) { client.navigate(client.url); });
      });
    })
  );
  self.clients.claim();
});
