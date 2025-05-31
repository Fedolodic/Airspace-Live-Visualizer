const CACHE_NAME = 'airspace-cache-v1';
const API_URL = 'https://opensky-network.org/api/states/all';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './globe.js',
  './api.js',
  './utils.js',
  './sample.json',
  './assets/plane.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.href === API_URL) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
        .then(resp => resp || caches.match('./sample.json'))
    );
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request))
    );
  }
});
