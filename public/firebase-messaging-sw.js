
// This service worker is intentionally left almost empty.
// Its primary purpose is to be registered by the browser to enable the Push API.
// The actual push event handling logic is in next-pwa's generated service worker.

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'DietLogAI';
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-96x96.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
