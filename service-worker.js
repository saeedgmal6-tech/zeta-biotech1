const CACHE_NAME = 'zeta-biotech-shell-v1';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/zeta-ai.js', '/zeta-ai-core.js', '/zeta-ai-navigation-polish.js', '/site.webmanifest'];

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(SHELL); }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(key) { return key !== CACHE_NAME; }).map(function(key) { return caches.delete(key); }));
  }).then(function() { return self.clients.claim(); }));
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then(function(response) {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
    }
    return response;
  }).catch(function() { return caches.match(event.request).then(function(cached) { return cached || caches.match('/index.html'); }); }));
});
