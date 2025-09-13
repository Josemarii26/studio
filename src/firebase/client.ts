'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseConfig } from './config';
import { toast } from '@/hooks/use-toast';


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

/**
 * Encapsulates the entire process of requesting notification permission and getting the FCM token.
 * This version uses the robust navigator.serviceWorker.ready pattern.
 * @returns The FCM token as a string, or null if permission is denied or an error occurs.
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.error("Browser does not support notifications.");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Unable to get permission to notify.');
            return null;
        }
        
        console.log('Notification permission granted.');

        // Manually register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service worker registered successfully:', registration);

        // Wait for the service worker to be ready and active
        await navigator.serviceWorker.ready;
        console.log('Service worker is active and ready.');
        
        const messaging = getMessaging(app);
        
        // This is the VAPID key from your Firebase project settings
        const vapidKey = 'BDaRbWuq2j_Wu-wD-EQTQTxp9cCnWv4KMlT2aMuorn_izFA2SmW2iXLYlQDgt4Uu6R-jvTmZxq0UivAl-r534K8';

        // Now that the service worker is ready, get the token.
        const fcmToken = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (fcmToken) {
            console.log('FCM Token retrieved:', fcmToken);
            toast({ title: "Notifications enabled!" });
            return fcmToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token.', err);
        if (err instanceof Error) {
             toast({
                variant: 'destructive',
                title: "Subscription failed",
                description: err.message
             });
        } else {
             toast({
                variant: 'destructive',
                title: 'An unknown error occurred while setting up notifications.'
             });
        }
        return null;
    }
};


export { app, auth, db, googleProvider, facebookProvider };
