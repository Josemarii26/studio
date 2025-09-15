
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { getAppInstance } from '@/firebase/server';

// Input schema for the notification flow
export const SendNotificationInput = z.object({
  pushSubscription: z.any().describe('The user\'s push subscription token (string) or object.'),
  title: z.string().describe('The title of the notification'),
  body: z.string().describe('The body text of the notification'),
  data: z.optional(z.string()).describe('A URL to open when the notification is clicked'),
});

// --- AI Flow (optional, for structured AI operations) ---
export const sendNotificationFlow = ai.flow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInput,
    outputSchema: z.void(),
  },
  async ({ pushSubscription, title, body, data }) => {
    await sendNotification(pushSubscription, title, body, data);
  }
);

// --- Core Server-Side Send Function ---
export async function sendNotification(
  pushSubscription: any, // Can be a string token or an object with a token property
  title: string,
  body: string,
  data?: string
) {
  // Ensure Firebase Admin is initialized
  getAppInstance();

  // The pushSubscription can be the token string or an object containing the token.
  const token = typeof pushSubscription === 'string' ? pushSubscription : pushSubscription?.token;

  if (!token) {
    console.error('Error: Push subscription is invalid or missing a token.', pushSubscription);
    throw new Error('Push subscription is invalid or missing a token.');
  }

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
    token: token, // Use the extracted token here
  };

  try {
    await getMessaging().send(message);
    console.log(`Successfully sent notification to token: ${token}`);
  } catch (error) {
    console.error('Firebase Admin SDK error sending notification:', error);
    throw new Error('Failed to send push notification via Admin SDK.');
  }
}
