
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
            
            toast({
                title: payload.notification?.title || 'New Notification',
                description: payload.notification?.body || '',
            });
        });

        return () => unsubscribe();
    }
  }, [toast]);

  // Logic for initial subscription
  useEffect(() => {
    const subscribeAndSaveToken = async (userId: string) => {
        try {
            const token = await requestNotificationPermission();
            if (token) {
                console.log('[Push Manager] FCM Token received, saving to profile...');
                // **FIX: Save the token directly as a string**
                await saveUserProfileFromClient(userId, { 
                    pushSubscription: token 
                });
                console.log('[Push Manager] Successfully subscribed and updated profile.');
                toast({ title: t('notifications.subscription-success') });
            } else {
                console.warn('[Push Manager] Failed to get FCM token.');
                toast({ title: t('notifications.subscription-failed'), variant: 'destructive' });
            }
        } catch (error) {
            console.error('[Push Manager] Error during subscription process:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (user && isLoaded && userProfile && !isProcessing) {
      // Check if permission is granted but we don't have a token saved in our DB
      if ('Notification' in window && Notification.permission === 'granted' && !userProfile.pushSubscription) {
        console.log('[Push Manager] Permission is granted, but no subscription found in DB. Subscribing...');
        setIsProcessing(true);
        subscribeAndSaveToken(user.uid);
      }
    }
  }, [user, isLoaded, userProfile, isProcessing, toast, t]);

  return null;
}
