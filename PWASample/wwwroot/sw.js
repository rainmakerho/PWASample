"use strict";

var cacheName = 'PWASample-v1';
const CacheNames = [
    cacheName,
];
var appShellFiles = [
    'css/site.css',
    'assets/apple-icon-180x180.png',
    'assets/manifest-icon-192.png',
    'assets/manifest-icon-512.png',
    'lib/bootstrap/dist/css/bootstrap.min.css',
    'lib/jquery/dist/jquery.min.js',
    'lib/bootstrap/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/pwacompat',
    '/',
    '/Photo',
    '/Map',
    '/test',
    'v2.html'
];
var freshFileNames = [
    'sw.js',
    'swRegister.js',
    'manifest.json',
];

self.addEventListener("install", (event) => {
    console.log('Cache appshell Files...');
    self.skipWaiting();
    const preCache = async () => {
        const cache = await caches.open(cacheName);
        return cache.addAll(appShellFiles);
    };
    event.waitUntil(preCache());
});

self.addEventListener("activate", (event) => {
    console.log("From SW: Activate Event");
    self.clients.claim();
    const clearCache = async () => {
        const keys = await caches.keys();
        keys.forEach(async (k) => {
            if (CacheNames.includes(k)) {
                return;
            }
            await caches.delete(k);
        });
    };
    event.waitUntil(clearCache());
});


self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    const requestPath = requestUrl.pathname;
    const fileName = requestPath.substr(requestPath.lastIndexOf('/') + 1);
    if (freshFileNames.indexOf(fileName) > -1 || 
        requestPath.indexOf('/api/') > -1) {
        return event.respondWith(fetch(event.request));
    };
    return event.respondWith(networkFirstStrategy(event.request));
})

const cacheFirstStrategy = async (request) => {
    const cacheResponse = await caches.match(request);
    return cacheResponse || fetchRequestandCache(request);
}

const networkFirstStrategy = async (request) => {
    try {
        return await fetchRequestandCache(request);
    } catch (ex) {
        console.log(ex);
        return await caches.match(request);
    }
}

const fetchRequestandCache = async (request) => {
    const networkResponse = await fetch(request);
    const clonedResponse = networkResponse.clone();
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse);
    return clonedResponse;
}


// push events.....

self.addEventListener('notificationclose', event => {
    console.log('notification closed', event)
})

self.addEventListener('notificationclick', event => {
    if (event.action === "search") {
        clients.openWindow(`https://github.com/rainmakerho/PWASample`);
    } else if (event.action === "close") {
        clients.openWindow(`https://rainmakerho.github.io/`);
    };

    console.log('notification clicked', event)

    self.registration.getNotifications()
        .then(ns => ns.forEach(n => n.close()))
})

self.addEventListener('push', event => {
    const payload = event.data.text();
    self.registration.showNotification(payload);
});