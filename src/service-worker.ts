/// <reference lib="webworker" />

// Define a unique cache name
const CACHE_NAME = 'mini-textarea-cache-v1';

// Resources to cache initially
const INITIAL_CACHED_RESOURCES = [
    '/',
    '/index.html',
    '/src/main.ts',
    '/src/style.css',
    '/favicon.svg',
    '/manifest.json'
];

// TypeScript declarations
declare const self: ServiceWorkerGlobalScope;

// Install event - cache initial resources
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching initial resources');
                return cache.addAll(INITIAL_CACHED_RESOURCES);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            );
        })
    );
});

// Fetch event - network first strategy
self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
        // Try network first
        fetch(event.request)
            .then(response => {
                // Clone the response since it can only be consumed once
                const responseClone = response.clone();

                // Cache the fresh response
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseClone);
                    });

                return response;
            })
            .catch(() => {
                // If network fails, try the cache
                console.log('Service Worker: Network failed, falling back to cache for', event.request.url);
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // If not in cache either, return a fallback
                        if (event.request.url.indexOf('.html') > -1) {
                            return caches.match('/index.html') as Promise<Response>;
                        }

                        // For non-HTML requests, just return an error response
                        return new Response('Network error occurred', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Service worker scope
export { }; 