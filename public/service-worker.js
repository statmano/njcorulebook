this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1.25').then(function(cache) {
      return cache.addAll([
        '/style.css',
        '/app.js',
        '../views/404.html',
        '../views/offline.html'
      ]);
    })
  );
});

this.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      caches.match(event.request).then(function(resp) {
        return resp || fetch(event.request).then(function(response) {
          if((event.request.url.includes('chrome-extension'))){
            //skip any caching
            return response;
          }
          if (['404','0'].includes(response.status)) {
            return caches.match('../views/404.html');
          }
          return caches.open('v1.25').then(function(cache) {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });
      }).catch(error => {
        return caches.match('../views/offline.html');
      })
    })
  );
});