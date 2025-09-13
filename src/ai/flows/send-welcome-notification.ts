'use server';
/**
 * @fileOverview A flow for sending a welcome push notification to a user.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { loadUserProfile } from '@/firebase/firestore';
import { sendNotificationFlow } from './send-notification';
import { getI18n } from '@/locales/server';

const SendWelcomeNotificationInputSchema = z.object({
  userId: z.string().describe('The UID of the user to send the notification to.'),
  locale: z.string().describe('The locale of the user for translation.'),
});
export type SendWelcomeNotificationInput = z.infer<typeof SendWelcomeNotificationInputSchema>;


const sendWelcomeNotificationFlow = ai.defineFlow(
  {
    name: 'sendWelcomeNotificationFlow',
    inputSchema: SendWelcomeNotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ userId, locale }) => {
    const userProfile = await loadUserProfile(userId);

    if (!userProfile) {
      return { success: false, message: 'User profile not found.' };
    }

    if (!userProfile.pushSubscription) {
      return { success: false, message: 'User has no push subscription token.' };
    }
    
    const t = await getI18n(locale as 'en' | 'es');

    const success = await sendNotificationFlow({
      subscription: userProfile.pushSubscription,
      title: t('notifications.welcome-title'),
      body: t('notifications.welcome-body', { name: userProfile.name.split(' ')[0] }),
    });

    if (success) {
      return { success: true, message: 'Welcome notification sent.' };
    } else {
      return { success: false, message: 'Failed to send welcome notification.' };
    }
  }
);

export async function sendWelcomeNotification(input: SendWelcomeNotificationInput): Promise<{ success: boolean; message: string; }> {
    return await sendWelcomeNotificationFlow(input);
}
