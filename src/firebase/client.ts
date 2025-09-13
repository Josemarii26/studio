
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseConfig } from './config';
import { saveNotificationSubscription } from '@/ai/flows/request-notification-permission';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

/**
 * Encapsulates the entire process of requesting notification permission,
 * getting the FCM token, and saving it to the backend. This version ensures
 * the service worker is ready before attempting to get a token.
 * @param user The authenticated Firebase user object.
 * @param t The translation function from i18n.
 */
export const requestNotificationPermissionAndSaveToken = async (user: User, t: (key: string) => string) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert(t('notifications.permission-unsupported-desc'));
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Unable to get permission to notify.');
            alert(t('notifications.permission-denied-title'));
            return;
        }
        
        console.log('Notification permission granted.');

        // Explicitly register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service worker registered successfully:', registration);

        // Wait for the service worker to be ready and active
        await navigator.serviceWorker.ready;
        console.log('Service worker is active and ready.');
        
        const messaging = getMessaging(app);
        
        // Hardcoded VAPID key to eliminate environment variable issues.
        const vapidKey = 'BDaRbWuq2j_Wu-wD-EQTQTxp9cCnWv4KMlT2aMuorn_izFA2SmW2iXLYlQDgt4Uu6R-jvTmZxq0UivAl-r534K8';

        if (!vapidKey) {
            console.error("VAPID public key is not defined. Cannot get FCM token.");
            return;
        }

        // Now that the service worker is ready, get the token.
        const fcmToken = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (fcmToken) {
            console.log('FCM Token retrieved:', fcmToken);
            await saveNotificationSubscription({ userId: user.uid, subscription: fcmToken });
            alert(t('notifications.permission-granted-title'));
        } else {
            console.log('No registration token available. Request permission to generate one.');
            alert(t('notifications.permission-denied-title'));
        }
    } catch (err) {
        console.error('An error occurred while retrieving token.', err);
        if (err instanceof Error) {
             alert("Subscription failed: " + err.message);
        } else {
             alert('An error occurred while setting up notifications. Please try again later.');
        }
    }
};


export { app, auth, db, googleProvider, facebookProvider };
