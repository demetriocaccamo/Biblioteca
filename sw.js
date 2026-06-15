const CACHE = 'biblioteca-v5';
const PRECACHE = [
  './',
  './index.html',
  './support.js',
  './data/books.json',
  './assets/icon-1024.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for API calls (ISBN lookup, covers), cache-first for local assets
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  if (isLocal) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }))
    );
  }
});
