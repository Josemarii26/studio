// Import Firebase libraries using importScripts
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
// This is HARDCODED because the service worker runs in the browser and doesn't have access to process.env
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Get an instance of Firebase Messaging in the service worker
const messaging = firebase.messaging();

// Note: Background message handling would go here, but for now,
// the primary purpose of this file is just to exist and be registered
// so that Firebase can generate a token.
