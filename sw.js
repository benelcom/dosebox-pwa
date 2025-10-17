// Simple offline-first cache
const CACHE_NAME = 'dosebox-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event)=>{
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp=>{
      // Runtime cache for GET requests
      if(req.method==='GET' && resp.status===200){
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, respClone));
      }
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
