const CACHE_NAME = 'zain-technologies-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/governance.html',
  '/contact.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/assets/img/logo.svg',
  '/assets/img/apple-touch-icon.png',
  '/manifest.webmanifest',
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request);
      }
    )
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form') {
    event.waitUntil(sendContactForm());
  }
});

// Push notifications (optional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/assets/img/logo.svg',
    badge: '/assets/img/logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/assets/img/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/img/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Zain Technologies', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for form submission
async function sendContactForm() {
  try {
    // Get stored form data from IndexedDB or localStorage
    // This is a placeholder for actual implementation
    console.log('Background sync: Contact form processed');
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error;
  }
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});