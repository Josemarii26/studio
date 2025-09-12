'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, FacebookAuthProvider, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { firebaseConfig } from './config';
import { saveNotificationSubscription } from '@/ai/flows/request-notification-permission';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set session persistence
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();


// --- Firebase Cloud Messaging ---
/**
 * Encapsulates the entire process of requesting notification permission,
 * getting the FCM token, and saving it to the backend.
 * @param user The authenticated Firebase user object.
 * @param t The translation function from i18n.
 */
export const requestNotificationPermissionAndSaveToken = async (user: User, t: (key: string) => string) => {
    if (typeof window === 'undefined') return;

    try {
        const messagingSupport = await isSupported();
        if (!messagingSupport) {
            alert(t('notifications.permission-unsupported-desc'));
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const messaging = getMessaging(app);
            const fcmToken = await getToken(messaging, {
                vapidKey: 'BDaRbWuq2j_Wu-wD-EQTQTxp9cCnWv4KMlT2aMuorn_izFA2SmW2iXLYlQDgt4Uu6R-jvTmZxq0UivAl-r534K8',
            });

            if (fcmToken) {
                console.log('FCM Token retrieved:', fcmToken);
                await saveNotificationSubscription({ userId: user.uid, subscription: fcmToken });
                alert(t('notifications.permission-granted-title'));
            } else {
                console.log('No registration token available. Request permission to generate one.');
                alert(t('notifications.permission-denied-title'));
            }
        } else {
            console.log('Unable to get permission to notify.');
            alert(t('notifications.permission-denied-title'));
        }
    } catch (err) {
        console.error('An error occurred while retrieving token.', err);
        alert('An error occurred while setting up notifications. Please try again later.');
    }
};


export { app, auth, db, googleProvider, facebookProvider };
