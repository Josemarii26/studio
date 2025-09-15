
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

    try {
      await sendNotificationFlow({
        pushSubscription: subscription,
        title: "Test Notification",
        body: "This is a test notification from DietLogAI.",
      });

      console.log('[Flow] Test notification sent successfully.');
      return { success: true, message: 'Test notification sent.' };
    } catch (error) {
      console.log('[Flow] Failed to send test notification.', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Failed to send test notification: ${errorMessage}` };
    }
  }
);

export async function sendTestNotification(input: SendTestNotificationInput): Promise<{ success: boolean; message: string; }> {
    return await sendTestNotificationFlow(input);
}
