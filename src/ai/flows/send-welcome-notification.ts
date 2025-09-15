
'use server';
/**
 * @fileOverview A flow for sending a welcome push notification to a user.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { loadUserProfile, saveUserProfile } from '@/firebase/admin-firestore';
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
    console.log('[Flow] sendWelcomeNotificationFlow started for user:', userId);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const userProfile = await loadUserProfile(userId);

    if (!userProfile) {
      console.error('[Flow] User profile not found for user:', userId);
      return { success: false, message: 'User profile not found.' };
    }

    if (!userProfile.pushSubscription) {
      console.log('[Flow] User has no push subscription token.');
      return { success: false, message: 'User has no push subscription token.' };
    }
    
    if (userProfile.welcomeNotificationSent) {
        console.log('[Flow] Welcome notification already sent.');
        return { success: true, message: 'Welcome notification already sent.' };
    }
    
    const t = await getI18n(locale as 'en' | 'es');

    try {
      await sendNotificationFlow({
        pushSubscription: userProfile.pushSubscription,
        title: t('notifications.welcome-title'),
        body: t('notifications.welcome-body', { name: userProfile.name.split(' ')[0] }),
      });

      console.log('[Flow] Welcome notification sent successfully.');
      await saveUserProfile(userId, { welcomeNotificationSent: true });
      return { success: true, message: 'Welcome notification sent.' };

    } catch (error) {
      console.log('[Flow] Failed to send welcome notification.', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Failed to send welcome notification: ${errorMessage}` };
    }
  }
);

export async function sendWelcomeNotification(input: SendWelcomeNotificationInput): Promise<{ success: boolean; message: string; }> {
    return await sendWelcomeNotificationFlow(input);
}
