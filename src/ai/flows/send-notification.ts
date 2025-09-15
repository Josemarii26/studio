
'use server';
/**
 * @fileOverview A flow for sending web push notifications via the Firebase Admin SDK.
 *
 * - sendNotification - A function that handles sending a push notification.
 * - SendNotificationInput - The input type for the sendNotification function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { getAppInstance } from '@/firebase/server'; // Correctly get the initialized app instance

// The Firebase Admin SDK is now initialized centrally in src/firebase/server.ts.
// We no longer need any initialization logic in this file.

export const SendNotificationInput = z.object({
  subscription: z.string().describe('The push subscription object as a JSON string'),
  title: z.string().describe('The title of the notification'),
  body: z.string().describe('The body text of the notification'),
  data: z.optional(z.string()).describe('A URL to open when the notification is clicked'),
});

export const sendNotificationFlow = ai.flow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInput,
    outputSchema: z.void(),
  },
  async ({ subscription, title, body, data }) => {
    await sendNotification(subscription, title, body, data);
  }
);

export async function sendNotification(
  subscription: any, // Can be a string or an object
  title: string,
  body: string,
  data?: string
) {
  getAppInstance(); // Ensures the app is initialized before proceeding

  let parsedSubscription = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;

  const message = {
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: 'https://dietlog.ai/favicon.ico',
      },
      fcm_options: {
        link: data || '/',
      },
    },
    token: parsedSubscription.token,
  };

  try {
    await getMessaging().send(message);
    console.log('Successfully sent notification');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
}
