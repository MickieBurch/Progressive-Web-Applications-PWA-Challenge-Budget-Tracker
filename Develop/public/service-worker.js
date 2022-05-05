const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "/assets/js/db.js",

]

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";


self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
  self.skipwaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key, i) {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i]);
        }
      }));
    })
  );
  self.clients.claim();
});



self.addEventListener('fetch', function (e) {
    if(evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', evt.request.url);


e.respondWith(
    caches.open(DATA_CACHE_NAME).then(function (e){
        return fetch(e.request)
        .then(response => {
            if (response.status === 200){
                cache.put(evt.request.url, response.clone());
            }
            return response;
        })
        .catch(err => {
            return cache.match(e.request);
        });
    })
    );
    return;
}

e.respondWith(
    caches.open(CACHE_NAME).then(function (e){
      return cache.match(e.request).then(response => {
        return response || fetch(e.request);
      });
    })
  );
});
