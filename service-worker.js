var cacheName = 'weatherPAW-step-6-1'
var dataCacheName = 'weatherData-v1'
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
]
// Instalacion SW
// Agrega los archivos del Shell del App al cache
self.addEventListener('install', e => {
    console.log('[ServiceWorker] Install')
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache)
        })
    )
})

// Activa SW
// Lo activa cuando se cierra la ventana del app
// Removemos el cache antiguo
self.addEventListener('activate', e => {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache: ', key);
                    return caches.delete(key)
                }
            }))
        })
    )
    return self.clients.claim()
})

// Intercepta las peticiones de archivos del app
// self.addEventListener('fetch', e => {
//     console.log('[ServiceWorker] Fetch: ', e.request.url);
//     e.respondWith(
//         caches.match(e.request).then(response => {
//             return response || fetch(e.request)
//         })
//     )
// })
self.addEventListener('fetch', e => {
    console.log('[ServiceWorker] Fetch: ', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';

    if (e.request.url.indexOf(dataUrl) > -1) {
        // Cuando la peticion contiene dataUrl, el app pregunta for
        // data fresca. En este caso, el SW siempre va a la red
        // y entonces cachea la respuesta. Esto es llamada la estrategia
        // "Cache despues de red"
        // * Para traer peticiones de fuera del proyecto y guardarlas en cache
        e.respondWith(
            caches.open(dataCacheName).then(cache => {
                return fetch(e.request).then(response => {
                    cache.put(e.request.url, response.clone())
                    return response
                })
            })
        )    
    } else {
        e.respondWith(
            caches.match(e.request).then(response => {
                return response || fetch(e.request)
            })
        )
    }
})








// Lanza Notificaciones
self.addEventListener('push', e => {
    console.log('[Service Worker] Push Recived: ', e);
    console.log(`[Service Worker] Push had this data: "${e.data.text()}"`);

    const title = 'Push Codelab'
    const options = {
        // body: 'Yay it works',
        body: e.data.text(),
        icon: 'images/icon.png',
        badge: 'images/badge.png',
        tag: 'request',
        actions: [
            {action: 'yes', title: 'Yes!', icon: 'images/yes.png'},
            {action: 'no', title: 'No!', icon: 'images/no.png'}
        ],
        data: {
            msn: 'Mensaje de la notificacion'
        }
    }

    e.waitUntil(
        self.registration.showNotification(title, options)
    )
})

self.addEventListener('notificationclick', e => {
    console.log('[Service Worker] Notification click Received.');
    console.log('[Service Worker] Event Notification: ', e);
    console.log('[Service Worker] Data from notification: ', e.notification.data.msn);
    
    e.notification.close()

    if (e.action === 'yes') {
        e.waitUntil(
            clients.openWindow('https://developers.google.com/web/')
        )
    }
    
})