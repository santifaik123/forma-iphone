const prefix = 'forma-shell-v1:'
const cacheName = prefix + '98811880018283d6f6'
const files = ["apple-touch-icon.png","assets/dm-sans-latin-wght-normal-Xz1IZZA0.woff2","assets/geist-latin-wght-normal-BgDaEnEv.woff2","assets/index-D9CKFsl4.js","assets/index-dI5PL7la.css","icon-192.png","icon-512.png","index.html","licenses.txt","manifest.webmanifest","robots.txt"]
const scope = self.registration.scope
const cacheKey = url => new URL(url, scope).href
const shell = cacheKey('index.html')
const known = new Set(files.map(cacheKey))

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(
    files.map(file => new Request(cacheKey(file), { cache: 'reload' })),
  )))
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName).map(name => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return
  if (request.mode === 'navigate') {
    event.respondWith(caches.open(cacheName).then(async cache => (await cache.match(shell)) || fetch(request)))
    return
  }
  const url = new URL(request.url)
  url.search = ''
  if (known.has(url.href)) {
    event.respondWith(caches.open(cacheName).then(async cache => (await cache.match(url.href)) || fetch(request)))
  }
})
