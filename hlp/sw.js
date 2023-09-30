const CACHE_NAME = 'cache0';

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
    '/'
];

// Listener for the install event - pre-caches our assets list on service worker install.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(PRECACHE_ASSETS);
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // match the request to our cache
            const cachedResponse = await cache.match(event.request);

            // check if we got a valid response
            if (cachedResponse) return cachedResponse;

            // Otherwise, go to the network
            return fetch(event.request);
        })()
    );
});