'use server';
/**
 * @fileOverview A flow for sending web push notifications via web-push library.
 *
 * - sendNotification - A function that handles sending a push notification.
 * - SendNotificationInput - The input type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendNotificationInputSchema = z.object({
  subscription: z.any().describe('The PushSubscription object from the browser.'),
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
  async ({ subscription, title, body, icon }) => {
    const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

    if (!VAPID_SUBJECT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("VAPID details are not configured on the server. Cannot send notification.");
      return false;
    }

    try {
      const webpush = await import('web-push');
      webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      );

      const payload = JSON.stringify({
        title,
        body,
        icon: icon || '/icon-192x192.png',
      });
      
      await webpush.sendNotification(subscription, payload);
      console.log('Successfully sent push notification.');
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }
);


export async function sendNotification(input: SendNotificationInput): Promise<boolean> {
    return await sendNotificationFlow(input);
}
