
// Import the Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This is the hardcoded Firebase configuration
const firebaseConfig = {
  projectId: "diet-log-ai",
  appId: "1:782169722368:web:7f6d149032f609e2587f27",
  storageBucket: "diet-log-ai.appspot.com",
  apiKey: "REDACTED",
  authDomain: "diet-log-ai.firebaseapp.com",
  messagingSenderId: "782169722368",
  measurementId: "G-NJ1J22S8MF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the messaging service
const messaging = firebase.messaging();

// The service worker can be empty, but it must exist for Firebase to work.
// You can add background message handling here if needed in the future.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
