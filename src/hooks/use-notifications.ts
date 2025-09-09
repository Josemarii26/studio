
'use client';

import { useEffect, useState } from 'react';
import { messaging } from '@/firebase/client';
import { getToken, onMessage } from 'firebase/messaging';
import { useUserStore } from './use-user-store';
import { useToast } from './use-toast';
import { useI18n } from '@/locales/client';

export function useNotifications() {
  const { userProfile, setUserProfile, isLoaded } = useUserStore();
  const { toast } = useToast();
  const t = useI18n();
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    // Ensure this only runs on the client and messaging is supported.
    if (typeof window === 'undefined' || !messaging) return;

    // Listen for incoming messages when the app is in the foreground.
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received.', payload);
      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  useEffect(() => {
    if (!isLoaded || !userProfile || permissionRequested) {
      return;
    }

    const requestPermission = async () => {
      // Mark as requested to prevent asking again in the same session.
      setPermissionRequested(true);

      // Check if we already have a token
      if (userProfile.fcmToken) {
        console.log('FCM token already exists for this user.');
        return;
      }

      try {
        const currentPermission = await Notification.requestPermission();

        if (currentPermission === 'granted') {
          console.log('Notification permission granted.');
          toast({
            title: t('notifications.permission-granted-title'),
            description: t('notifications.permission-granted-desc'),
          });

          // VAPID key is required for web push notifications
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            throw new Error("VAPID key is missing. Cannot get FCM token.");
          }

          const token = await getToken(messaging, { vapidKey });
          
          if (token) {
            console.log('FCM Token:', token);
            await setUserProfile({ ...userProfile, fcmToken: token });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    // We delay the request slightly to not bombard the user immediately on load.
    const timer = setTimeout(requestPermission, 5000);
    return () => clearTimeout(timer);

  }, [isLoaded, userProfile, setUserProfile, toast, t, permissionRequested]);
}
