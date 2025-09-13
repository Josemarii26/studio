
'use server';
/**
 * @fileOverview A flow for sending a welcome push notification to a user.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { loadUserProfile, saveUserProfile } from '@/firebase/firestore';
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
    
    // There can be a delay in Firestore propagation. Let's wait a moment.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

    const success = await sendNotificationFlow({
      subscription: userProfile.pushSubscription,
      title: t('notifications.welcome-title'),
      body: t('notifications.welcome-body', { name: userProfile.name.split(' ')[0] }),
    });

    if (success) {
      console.log('[Flow] Welcome notification sent successfully.');
      // Mark that the notification has been sent to prevent duplicates
      await saveUserProfile(userId, { ...userProfile, welcomeNotificationSent: true });
      return { success: true, message: 'Welcome notification sent.' };
    } else {
      console.log('[Flow] Failed to send welcome notification via sendNotificationFlow.');
      return { success: false, message: 'Failed to send welcome notification.' };
    }
  }
);

export async function sendWelcomeNotification(input: SendWelcomeNotificationInput): Promise<{ success: boolean; message: string; }> {
    return await sendWelcomeNotificationFlow(input);
}
