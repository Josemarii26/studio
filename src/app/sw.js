
'use client';

import { importScripts } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// This is the PWA part
// ----------------------------------------------------------
// On install, precache all static resources
self.addEventListener('install', (event) => {
  const manifest = self.__WB_MANIFEST;
  if (manifest) {
    event.waitUntil(
      precacheAndRoute(manifest)
    );
  }
});

// For other requests, use a stale-while-revalidate strategy
registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new StaleWhileRevalidate()
);
// ----------------------------------------------------------


// This is the Firebase part
// ----------------------------------------------------------
// We need to import the Firebase app and messaging scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Optional: Set a background message handler
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon || '/icon-192x192.png',
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}
// ----------------------------------------------------------
