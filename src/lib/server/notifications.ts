
'use server';

import { getMessaging } from 'firebase-admin/messaging';
import { getAppInstance } from '@/firebase/server';

export async function sendNotification(
  pushSubscription: string, // **FIX: Expect a string token directly**
  title: string,
  body: string,
  data?: string
) {
  // Ensure Firebase Admin is initialized
  getAppInstance();

  if (!pushSubscription) {
    console.error('Error: Push subscription token is missing.');
    throw new Error('Push subscription token is missing.');
  }

  const message = {
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: 'https://dietlog.ai/leaf.png',
      },
      fcm_options: {
        link: data || '/', 
      },
    },
    token: pushSubscription, // **FIX: Use the token directly**
  };

  try {
    await getMessaging().send(message);
    console.log(`Successfully sent notification to token: ${pushSubscription}`);
  } catch (error) {
    console.error('Firebase Admin SDK error sending notification:', error);
    // Log more specific details if available
    if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string, message: string };
        if (firebaseError.code === 'messaging/registration-token-not-registered') {
            console.error('The provided registration token is not valid. It may be expired or deregistered.');
        }
    }
    throw new Error('Failed to send push notification via Admin SDK.');
  }
}
