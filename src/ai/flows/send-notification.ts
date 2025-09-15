
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { getAppInstance } from '@/firebase/server';

// Input schema for the notification flow
export const SendNotificationInput = z.object({
  pushSubscription: z.any().describe('The user\'s push subscription object, which must contain a \'token\' field.'),
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
  pushSubscription: any, // The user profile\'s pushSubscription object
  title: string,
  body: string,
  data?: string
) {
  // Ensure Firebase Admin is initialized
  getAppInstance();

  // --- CORE FIX ---
  // Directly extract the token from the pushSubscription object.
  // This was the source of the "Exactly one of topic, token or condition is required" error.
  const token = pushSubscription?.token;

  if (!token) {
    console.error('Error: Push subscription object is missing the \'token\' field.', pushSubscription);
    throw new Error('Push subscription is invalid and is missing a token.');
  }
  // --- END FIX ---

  const message = {
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: 'https://dietlog.ai/favicon.ico', // Using a publicly available icon
      },
      fcm_options: {
        link: data || '/', // Link to open when the notification is clicked
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
