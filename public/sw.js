// Community Food Donation Network Service Worker
// Version: 1.0.0
const CACHE_NAME = 'cfdn-app-shell-v1';

// Safe app-shell resources to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: NEVER cache Firebase Auth, Firestore dynamic data, Cloudinary uploads, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('cloudinary') ||
    url.pathname.includes('/api/') ||
    url.hostname.includes('maptiler')
  ) {
    return; // Pass through to network directly
  }

  // For HTML navigation requests, use Network-First strategy so users get latest updates
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html') || caches.match('/'))
    );
    return;
  }

  // For static assets (JS, CSS, images, icons, fonts): Cache-first with background revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      });
    })
  );
});

// ==========================================
// PUSH NOTIFICATION & NOTIFICATION CLICK HANDLING
// ==========================================

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '🍱 New Food Donation Alert', body: event.data ? event.data.text() : 'A new donation is available!' };
  }

  const title = data.notification?.title || data.title || '🍱 New Food Donation Available!';
  const body = data.notification?.body || data.body || 'A new surplus food donation is ready for rescue.';
  const donationId = data.data?.donationId || data.donationId;
  const targetUrl = data.data?.url || data.url || (donationId ? '/ngo/donations/' + donationId : '/ngo/donations');

  const options = {
    body: body,
    icon: '/icons/icon-192.png',
    badge: '/favicon.svg',
    tag: donationId ? 'cfdn-donation-' + donationId : 'cfdn-alert',
    renotify: true,
    data: {
      url: targetUrl,
      donationId: donationId
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/ngo/donations';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (client.url.includes('/ngo/donations') || client.url.includes(location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
