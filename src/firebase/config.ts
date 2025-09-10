
// This configuration is now sourced from environment variables
// for better security and build-time configuration.
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  // This VAPID key is required for Web Push notifications.
  vapidKey: 'BPA9h41_ucyT3u2z1G_EwM9gqP_3y3wX6zX6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6Z6z6'
};
