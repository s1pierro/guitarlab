const cacheName = 'gao-2.0';

// App shell complet — tout ce qui est nécessaire pour fonctionner hors ligne
const appShell = [
    // Pages et scripts
    'index.html',
    'gao.js',
    'music-theory.js',
    'default-session.json',
    'manifest.json',

    // Définition guitare et modèle 3D
    'guitars/classique-6.json',
    'gao-beta-6.obj',
    'gao-beta-6.mtl',

    // Styles et polices
    'css/style.css',
    'css/gao-fonticons-max.css',
    'font/Comfortaa-VariableFont_wght.ttf',
    'font/gao-fonticons-max.woff2',
    'font/gao-fonticons-max.woff',
    'font/gao-fonticons-max.ttf',

    // Bibliothèques locales
    'js/Tone.js',

    // Three.js et addons (CDN)
    'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
    'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/MTLLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/OBJLoader.js',

    // Icônes et assets audio
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

// Installation — pré-cache de tout l'app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(appShell))
    );
    self.skipWaiting();
});

// Activation — suppression des anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== cacheName).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch — réseau d'abord, cache en fallback (offline)
// Les requêtes vers des outils de debug (eruda) sont ignorées
self.addEventListener('fetch', event => {
    const url = event.request.url;
    if (url.includes('eruda')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Mettre à jour le cache avec la version fraîche
                const clone = response.clone();
                caches.open(cacheName).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
