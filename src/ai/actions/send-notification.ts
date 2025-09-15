
'use server';

import { getAppInstance } from '@/firebase/server';
import { getMessaging } from 'firebase-admin/messaging';

/**
 * Sends a push notification to a user's device.
 * @param subscription The push subscription object from the user's profile.
 * @param title The title of the notification.
 * @param body The body text of the notification.
 * @param url The URL to open when the notification is clicked.
 */
export async function sendNotification(
  subscription: any, // The push subscription object is complex, so we use 'any' for simplicity
  title: string,
  body: string,
  url: string
): Promise<void> {

  try {
    const app = getAppInstance();
    const messaging = getMessaging(app);

    const message = {
      notification: {
        title: title,
        body: body,
      },
      webpush: {
        fcm_options: {
          link: url,
        },
        notification: {
            icon: 'https://dietlog-ai.site/icons/icon-192x192.png',
        }
      },
      token: subscription.token, // The registration token of the device
    };

    await messaging.send(message);
    console.log('[Action] Notification sent successfully.');

  } catch (error) {
    console.error('[Action] Error sending notification:', error);
    // Re-throw the error so the calling flow can handle it
    throw new Error('Failed to send push notification.');
  }
}
