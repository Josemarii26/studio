
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
  if (!isBrowserSupported) {
    console.error("Firebase Messaging is not supported in this browser.");
    throw new Error("Firebase Messaging is not supported in this browser.");
  }
  
  const messaging = getMessaging(app);
  
  // Hard-coded VAPID key as a last resort to ensure it's available.
  const vapidKey = "BDaRbWuq2j_Wu-wD-EQTQTxp9cCnWv4KMIT2aMuorn_izFA2SmW2iXLYIQDgt4Uu6R-jvTmZxq0UivAl-r534K8";

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Get the token
      const fcmToken = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token.', error);
    throw error;
  }
};

export { app, auth, db, googleProvider, facebookProvider };
