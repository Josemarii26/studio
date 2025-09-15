
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendNotification } from '@/lib/server/notifications';


// Input schema for the notification flow
export const SendNotificationInput = z.object({
  // **FIX: Define the pushSubscription as a string**
  pushSubscription: z.string().describe("The user's FCM push subscription token."),
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
