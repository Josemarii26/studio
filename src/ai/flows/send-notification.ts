
'use server';
/**
 * @fileOverview A flow for sending push notifications via FCM.
 *
 * - sendNotification - A function to send a push notification.
 * - SendNotificationInput - The input type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

const SendNotificationInputSchema = z.object({
  token: z.string().describe('The FCM token of the device to notify.'),
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The body content of the notification.'),
  icon: z.string().optional().describe('The URL of the icon for the notification.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

// This function can be called from other server-side components.
export async function sendNotification(input: SendNotificationInput): Promise<void> {
  // Initialize Firebase Admin SDK if it hasn't been already.
  // This is safe to call multiple times.
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (e) {
      console.error("Firebase Admin SDK initialization error:", e);
    }
  }

  const { token, title, body } = input;

  if (!token) {
    console.log("No FCM token provided, skipping notification.");
    return;
  }

  const message: admin.messaging.Message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    webpush: {
      notification: {
        icon: input.icon || 'https://www.dietlog-ai.site/icons/icon-192x192.png',
        badge: 'https://www.dietlog-ai.site/icons/icon-72x72.png'
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error: any) {
    console.error('Error sending message:', error);
    // If the token is invalid, we should consider removing it from the user's profile.
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log(`Token ${token} is no longer valid. Consider removing it.`);
      // Optional: Add logic here to remove the token from Firestore.
    }
  }
}

// Define the Genkit flow, which simply wraps the sendNotification function.
const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    await sendNotification(input);
  }
);
