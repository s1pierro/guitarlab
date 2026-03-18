const cacheName = 'gao-2.0';

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

// Extensions toujours servies depuis le réseau (jamais depuis le cache)
const noCacheExtensions = ['.html', '.js', '.css', '.json', '.obj', '.mtl', '.ttf', '.woff', '.woff2'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(cacheFiles))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const noCache = noCacheExtensions.some(ext => url.pathname.endsWith(ext));

    if (noCache) {
        event.respondWith(fetch(event.request, { cache: 'no-store' }));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});
