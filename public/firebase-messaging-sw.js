
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// **THIS CONFIGURATION MUST BE HARDCODED**
// The service worker runs in a separate context from the web app and
// does not have access to the `process.env` variables.
const firebaseConfig = {
  apiKey: "AIzaSyBvGccscK_xTE4Voa54V2XUglmL82bvy2c",
  authDomain: "nutritrackai-tfxng.firebaseapp.com",
  projectId: "nutritrackai-tfxng",
  storageBucket: "nutritrackai-tfxng.firebasestorage.app",
  messagingSenderId: "673788699862",
  appId: "1:673788699862:web:6f6fa002571bc29dd95577"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/leaf.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
