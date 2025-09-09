
'use client';

import { useEffect, useState } from 'react';
import { messaging } from '@/firebase/client';
import { getToken, onMessage } from 'firebase/messaging';
import { useUserStore } from './use-user-store';
import { useToast } from './use-toast';
import { useI18n } from '@/locales/client';
import { sendNotification } from '@/ai/flows/send-notification';

export function useNotifications() {
  const { userProfile, setUserProfile, isLoaded } = useUserStore();
  const { toast } = useToast();
  const t = useI18n();
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !messaging) return;

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
      setPermissionRequested(true);

      if (userProfile.fcmToken) {
        console.log('FCM token already exists for this user.');
        return;
      }

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
            // Save token to user profile
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
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    const timer = setTimeout(requestPermission, 5000);
    return () => clearTimeout(timer);

  }, [isLoaded, userProfile, setUserProfile, toast, t, permissionRequested]);
}
