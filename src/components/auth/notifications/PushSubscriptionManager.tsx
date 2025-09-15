
'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from '@/firebase/client';
import { useUser } from '@/context/UserContext';
import { saveUserProfile } from '@/firebase/firestore';

const PushSubscriptionManager = () => {
  const { user } = useUser();
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const initializeMessaging = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const messaging = getMessaging(firebaseApp);

        // Handle incoming messages when the app is in the foreground
        onMessage(messaging, (payload) => {
          console.log('Message received. ', payload);
          setNotification(payload.notification);
          // Optionally, display the notification to the user in a custom way
        });

        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });

            if (currentToken && user) {
              console.log('FCM Token retrieved:', currentToken);
              // --- CORE FIX ---
              // Save the FCM token directly to the user's profile.
              // The server-side logic expects this specific structure.
              await saveUserProfile(user.uid, { 
                pushSubscription: { token: currentToken }
              });
              console.log('FCM token saved to user profile.');
              // --- END FIX ---
            }
          }
        } catch (error) {
          console.error('Error getting FCM token:', error);
        }
      }
    };

    if (user) {
      initializeMessaging();
    }

  }, [user]);

  return null; // This component does not render anything
};

export default PushSubscriptionManager;
