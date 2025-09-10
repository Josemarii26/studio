// This file MUST be in the /public folder

// We can't use imports in a service worker that references things outside its scope,
// so we can't import firebase/config. We must hardcode the config here.
// These are public keys and are safe to be exposed in the client.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only run this code in the browser
if (typeof window !== 'undefined') {
  self.addEventListener('install', (event) => {
    console.log('Firebase messaging service worker installed.');
  });

  self.addEventListener('push', (event) => {
    console.log('Push event received.', event);
    const notificationData = event.data.json();
    const { title, body, icon, badge } = notificationData.notification;
    
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        badge,
      })
    );
  });
}
