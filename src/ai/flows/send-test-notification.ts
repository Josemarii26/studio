
'use server';
/**
 * @fileOverview A flow for sending a test push notification.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendNotificationFlow } from './send-notification';

const SendTestNotificationInputSchema = z.object({
  subscription: z.string().describe('The push subscription token.'),
});
export type SendTestNotificationInput = z.infer<typeof SendTestNotificationInputSchema>;


const sendTestNotificationFlow = ai.defineFlow(
  {
    name: 'sendTestNotificationFlow',
    inputSchema: SendTestNotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ subscription }) => {
    console.log('[Flow] sendTestNotificationFlow started.');

    if (!subscription) {
      return { success: false, message: 'No push subscription token provided.' };
    }

    const success = await sendNotificationFlow({
      subscription: subscription,
      title: "Test Notification",
      body: "This is a test notification from DietLogAI.",
    });

    if (success) {
      console.log('[Flow] Test notification sent successfully.');
      return { success: true, message: 'Test notification sent.' };
    } else {
      console.log('[Flow] Failed to send test notification.');
      return { success: false, message: 'Failed to send test notification.' };
    }
  }
);

export async function sendTestNotification(input: SendTestNotificationInput): Promise<{ success: boolean; message: string; }> {
    return await sendTestNotificationFlow(input);
}
