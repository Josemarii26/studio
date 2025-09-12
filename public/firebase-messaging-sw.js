// firebase-messaging-sw.js
// Improved service worker for handling push notifications

self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
      console.log("Push data:", data);
    }
  } catch (e) {
    console.error("Error parsing push data:", e);
  }

  const title = data.title || "DietLogAI";
  const options = {
    body: data.body || "You have a new notification.",
    icon: data.icon || "/icon-192x192.png",
    badge: "/icon-96x96.png",
    tag: data.tag || "default",
    requireInteraction: false,
    silent: false,
    data: {
      url: data.url || "/dashboard",
      ...data
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log("Notification displayed successfully");
      })
      .catch(error => {
        console.error("Error displaying notification:", error);
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function(clientList) {
      // Buscar si ya hay una ventana abierta con la app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            // Navegar a la URL específica si es necesario
            if (client.navigate && targetUrl !== client.url) {
              return client.navigate(targetUrl);
            }
          });
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }).catch(error => {
      console.error("Error handling notification click:", error);
    })
  );
});

// Manejar cuando se cierra la notificación
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
});

// Activación del service worker
self.addEventListener('activate', event => {
  console.log('Service worker activated');
  event.waitUntil(clients.claim());
});

// Instalación del service worker
self.addEventListener('install', event => {
  console.log('Service worker installed');
  self.skipWaiting();
});
