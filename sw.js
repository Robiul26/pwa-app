const cacheName = "app-rsrs";
const dynamicCacheName = "app-rsrs1";

const assets = [
    './',
    './js/app.js',
    './js/common.js',
    './js/materialize.min.js',
    './css/style.css',
    './css/materialize.min.css',
    './datrabase/db.json',
    './img/contact.png',
    './img/fruits/apple.jpg',
    './img/fruits/okra.jpg',
    './img/fruits/orange.jpg',
    './img/fruits/potato.jpg',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    './pages/default.html'
];

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
}



self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== cacheName)
                .map(key => caches.delete())
            )
        })
    )
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(e.request.url, fetchRes.clone())
                    limitCacheSize(dynamicCacheName, 2);
                    return fetchRes;
                })
            });
        }).catch(() => {
            if (e.request.url.indexOf('.html') > -1) {
                return caches.match('pages/default.html')
            }
        })
    );
});