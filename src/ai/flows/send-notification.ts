
'use server';
/**
 * @fileOverview A flow for sending web push notifications.
 *
 * - sendNotification - A function that handles sending a push notification.
 * - SendNotificationInput - The input type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { PushSubscription } from 'web-push';

const SendNotificationInputSchema = z.object({
  subscription: z.any().describe('The PushSubscription object of the recipient.'),
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
  async (input) => {
    // Dynamically import web-push and configure it only when the flow is executed.
    // This prevents build errors in environments where VAPID keys are not set.
    if (
      !process.env.VAPID_SUBJECT ||
      !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      !process.env.VAPID_PRIVATE_KEY
    ) {
      console.error("VAPID keys are not fully configured. Cannot send notification.");
      return false;
    }
    
    try {
      const webpush = await import('web-push');

      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );

      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        icon: input.icon || '/icon-192x192.png'
      });
      
      await webpush.sendNotification(input.subscription as PushSubscription, payload);
      console.log('Push notification sent successfully.');
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
