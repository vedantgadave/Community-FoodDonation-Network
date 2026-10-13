// Community Food Donation Network - Firebase Cloud Messaging Service Worker
// Handles background push notifications when browser/app is closed or in background

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase compat app with project configuration
firebase.initializeApp({
  apiKey: 'AIzaSyDjBeS7wVZzqAzpugZk9DmgOQfeFSEyG9I',
  authDomain: 'food-donation2-0.firebaseapp.com',
  projectId: 'food-donation2-0',
  storageBucket: 'food-donation2-0.firebasestorage.app',
  messagingSenderId: '932179098400',
  appId: '1:932179098400:web:6f8a677b6668e3ec377545',
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const title = payload.notification?.title || payload.data?.title || '🍱 New Food Donation Available!';
  const body = payload.notification?.body || payload.data?.body || 'A new food donation has been posted for pickup. Tap to view details.';
  const donationId = payload.data?.donationId;
  const clickAction = payload.data?.click_action || (donationId ? /ngo/donations/ : '/ngo/donations');

  const notificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/favicon.svg',
    tag: donationId ? cfdn-donation- : 'cfdn-alert',
    renotify: true,
    data: {
      url: clickAction,
      donationId,
    },
    actions: [
      {
        action: 'view-donation',
        title: 'View Details',
        icon: '/icons/icon-192.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/ngo/donations';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (client.url.includes('/ngo/donations')) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
