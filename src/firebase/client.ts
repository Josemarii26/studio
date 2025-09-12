
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set session persistence
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Initialize Firebase Cloud Messaging and get a reference to the service
export const getFCMToken = async () => {
  const isBrowserSupported = await isSupported();
  if (!isBrowserSupported || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log("Firebase Messaging is not supported in this browser.");
    return null;
  }

  try {
    const messaging = getMessaging(app);
    // Use the public key from environment variables
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
        throw new Error("VAPID key is not configured in environment variables.");
    }
    
    // Wait for the service worker to be ready
    const swRegistration = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
          vapidKey: vapidKey,
          serviceWorkerRegistration: swRegistration
      });
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
}

export { app, auth, db, googleProvider, facebookProvider };
