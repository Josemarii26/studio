// This file is intentionally blank in the source, but will be populated by the build process.
// It is needed for Firebase Messaging to work.
// DO NOT DELETE
'use client';
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');


// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "dietlog-ai",
  appId: "1:770451556948:web:7f6d44a95ab4724b07a522",
  storageBucket: "dietlog-ai.appspot.com",
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "dietlog-ai.firebaseapp.com",
  messagingSenderId: "770451556948",
  measurementId: "G-R56XQ6QY2G",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
