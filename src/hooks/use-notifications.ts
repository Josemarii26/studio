
'use client';

import { useEffect, useState, useCallback } from 'react';
import { messaging } from '@/firebase/client';
import { getToken, onMessage } from 'firebase/messaging';
import { useUserStore } from './use-user-store';
import { useToast } from './use-toast';
import { useI18n } from '@/locales/client';
import { sendNotification } from '@/ai/flows/send-notification';

// This hook now only handles the logic for getting permissions and the token.
// It no longer returns anything, it just works in the background.
export function useNotifications() {
  const { userProfile, setUserProfile, isLoaded } = useUserStore();
  const { toast } = useToast();
  const t = useI18n();
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Effect for handling incoming foreground messages
  useEffect(() => {
    if (typeof window === 'undefined' || !messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received.', payload);
      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, [toast]);


  // Main effect to request permission and get token
  useEffect(() => {
    // Conditions to exit early: not loaded, no profile, or already asked for permission.
    if (!isLoaded || !userProfile || permissionRequested || userProfile.fcmToken) {
      return;
    }

    const requestPermission = async () => {
      setPermissionRequested(true); // Mark that we've tried to ask.

      try {
        const currentPermission = await Notification.requestPermission();

        if (currentPermission === 'granted') {
          console.log('Notification permission granted.');
          
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            throw new Error("VAPID key is missing. Cannot get FCM token.");
          }

          const token = await getToken(messaging, { vapidKey });
          
          if (token) {
            console.log('FCM Token:', token);
            // Save token to user profile. This will trigger a re-render in components using the store.
            await setUserProfile({ ...userProfile, fcmToken: token });
            
            // Send welcome notification
            await sendNotification({
                token: token,
                title: t('notifications.welcome-title'),
                body: t('notifications.welcome-body', { name: userProfile.name.split(' ')[0] }),
            });

             toast({
                title: t('notifications.permission-granted-title'),
                description: t('notifications.permission-granted-desc'),
            });

          } else {
            console.log('No registration token available. Request permission to generate one.');
             toast({
                variant: "destructive",
                title: t('notifications.no-token-title'),
                description: t('notifications.no-token-desc'),
            });
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    // Delay the permission request slightly to avoid being intrusive on page load.
    const timer = setTimeout(requestPermission, 5000); 
    return () => clearTimeout(timer);

  }, [isLoaded, userProfile, setUserProfile, toast, t, permissionRequested]);
}
