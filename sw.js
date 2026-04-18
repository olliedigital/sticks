const CACHE = 'sticks-v14-topo';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => caches.open(CACHE).then(c => c.addAll(ASSETS)))
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase') || url.hostname.includes('stripe')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Network first for HTML, cache first for assets
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
