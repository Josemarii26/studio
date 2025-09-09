
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

export async function sendNotification(input: SendNotificationInput): Promise<void> {
  await sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // Initialize Firebase Admin SDK if it hasn't been already
    // This is moved inside the flow to ensure it only runs in a secure server environment.
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
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
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
      // We don't re-throw the error to prevent the client flow from breaking
      // if a notification fails (e.g., due to an invalid token).
    }
  }
);
