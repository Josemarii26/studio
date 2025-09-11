'use server';
/**
 * @fileOverview A flow for sending web push notifications via Firebase Admin SDK.
 *
 * - sendNotification - A function that handles sending a push notification.
 * - SendNotificationInput - The input type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps } from 'firebase-admin/app';
import { firebaseAdminConfig } from '@/firebase/admin-config';

// Initialize Firebase Admin SDK only if all credentials are provided
if (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
) {
    if (!getApps().length) {
        initializeApp(firebaseAdminConfig);
    }
}


const SendNotificationInputSchema = z.object({
  subscriptionToken: z.string().describe('The Firebase Cloud Messaging token of the recipient device.'),
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The body text of the notification.'),
  icon: z.string().optional().describe('The icon URL for the notification.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;


export const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.boolean(),
  },
  async ({ subscriptionToken, title, body, icon }) => {
    if (!getApps().length) {
      console.error("Firebase Admin SDK is not initialized. Cannot send notification.");
      return false;
    }

    const message = {
      token: subscriptionToken,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: icon || '/icon-192x192.png',
        },
      },
    };

    try {
      await getMessaging().send(message);
      console.log('Successfully sent message:', message.notification.title);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
);


export async function sendNotification(input: SendNotificationInput): Promise<boolean> {
    return await sendNotificationFlow(input);
}
