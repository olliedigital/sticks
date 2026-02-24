const CACHE = 'sticks-v6';
const ASSETS = ['/','/index.html','/manifest.json',
'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
'https://unpkg.com/react@18/umd/react.production.min.js',
'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
'https://unpkg.com/@babel/standalone/babel.min.js',
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'];
self.addEventListener('install', e => {e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate', e => {e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch', e => {
const url = new URL(e.request.url);
if(url.hostname.includes('supabase')){e.respondWith(fetch(e.request));return;}
e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {if(res.status===200){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return res;})));
});
