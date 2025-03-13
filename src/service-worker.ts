/// <reference lib="webworker" />

// Define a unique cache name
const CACHE_NAME = 'mini-textarea-cache-v1';

// Resources to cache initially
const INITIAL_CACHED_RESOURCES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg'
    // We'll dynamically cache other assets as they're requested
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
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
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
            }),
            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - network first strategy
self.addEventListener('fetch', (event: FetchEvent) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip browser extensions and chrome URLs
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;

    // Implement network-first strategy
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response since it can only be consumed once
                const responseClone = response.clone();

                // Cache successful responses
                if (response.ok) {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                            console.log('Service Worker: Cached new resource:', event.request.url);
                        });
                }

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

                        // If requesting a page, serve the index as fallback
                        if (event.request.mode === 'navigate') {
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