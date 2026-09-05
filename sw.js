const CACHE_NAME = 'zeta-biotech-shell-v2026-09-05';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/public-enhancements.js',
  '/public-features.js',
  '/public-next.js',
  '/zeta-ai.js',
  '/zeta-ai-core.js',
  '/zeta-ai-navigation-polish.js',
  '/site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL).catch(() => undefined)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/content/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => undefined);
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('/index.html'))));
});
