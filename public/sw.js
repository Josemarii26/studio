// This service worker is intentionally left blank.
// It will be populated with the necessary code by the next-pwa build process.
// For push notifications, the build process will inject the logic to handle the 'push' event.

self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const title = data.title || 'NutriTrackAI';
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
