
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set session persistence
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);

// Conditionally initialize messaging
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');


export { app, auth, db, googleProvider, facebookProvider, appleProvider, messaging };
