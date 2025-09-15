
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/hooks/use-user-store';
import { requestNotificationPermission } from '@/lib/firebase-messaging';
import { saveUserProfileFromClient } from '@/firebase/client-firestore';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/locales/client';
import { getMessaging, onMessage } from 'firebase/messaging';
import { app } from '@/firebase/client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

async function subscribeToPushNotifications(userId: string): Promise<PushSubscription | null> {
    if (!VAPID_PUBLIC_KEY) {
        console.error('VAPID public key is not defined. Cannot subscribe to push notifications.');
        return null;
    }

    try {
        const token = await requestNotificationPermission();
        if (token) {
            const subscriptionObject = JSON.parse(JSON.stringify(token)); // Ensure clean object
            await saveUserProfileFromClient(userId, { 
                pushSubscription: subscriptionObject 
            });
            // This function now primarily returns the token, not the full subscription object
            // The subscription logic is handled within requestNotificationPermission
            return {} as PushSubscription; // Return a placeholder
        }
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
    }

    return null;
}


/**
 * A component that handles the push notification subscription logic silently in the background
 * and listens for foreground messages.
 */
export function PushSubscriptionManager() {
  const { user } = useAuth();
  const { userProfile, isLoaded } = useUserStore();
  const { toast } = useToast();
  const t = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);

  // Listener for foreground messages
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const messaging = getMessaging(app);
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            
            // Show a toast notification
            toast({
                title: payload.notification?.title || 'New Notification',
                description: payload.notification?.body || '',
            });
        });

        return () => unsubscribe(); // Unsubscribe when component unmounts
    }
  }, [toast]);

  // Logic for initial subscription
  useEffect(() => {
    if (user && isLoaded && userProfile && !isProcessing) {

      if ('Notification' in window && Notification.permission === 'granted' && !userProfile.pushSubscription) {
        console.log('[Push Manager] Permission is granted, but no subscription found. Subscribing...');
        setIsProcessing(true);

        subscribeToPushNotifications(user.uid)
            .then(subscription => {
                if (subscription) {
                    console.log('[Push Manager] Successfully subscribed and updated profile.');
                    toast({ title: t('notifications.subscription-success') });
                } else {
                    console.warn('[Push Manager] Failed to subscribe.');
                    toast({ title: t('notifications.subscription-failed'), variant: 'destructive' });
                }
            })
            .catch(err => {
                console.error('[Push Manager] Error during subscription:', err);
            })
            .finally(() => {
                setIsProcessing(false);
            });
      }
    }
  }, [user, isLoaded, userProfile, isProcessing, toast, t]);

  return null;
}
