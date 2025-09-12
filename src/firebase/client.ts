
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


// --- Firebase Cloud Messaging ---

// This function is designed to be called only on the client-side.
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const messagingSupport = await isSupported();
    if (!messagingSupport) {
      console.log("Firebase Messaging is not supported in this browser.");
      return null;
    }
    const messaging = getMessaging(app);

    // Get the registration token.
    const token = await getToken(messaging, { 
      vapidKey: "BDaRbWuq2j_Wu-wD-EQTQTxp9cCnWv4KMlT2aMuorn_izFA2SmW2iXLYlQDgt4Uu6R-jvTmZxq0UivAl-r534K8"
    });
    
    if (token) {
      console.log('FCM Token retrieved:', token);
      return token;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      // This typically means the user has not granted notification permissions yet.
      // The permission request should be handled before calling this function.
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
    return null;
  }
};


export { app, auth, db, googleProvider, facebookProvider };
