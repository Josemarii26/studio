
'use server';
/**
 * @fileOverview A server-side flow for saving a user's push notification subscription object.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { saveUserProfile } from '@/firebase/firestore';

const SaveNotificationSubscriptionInputSchema = z.object({
  userId: z.string().describe('The UID of the user.'),
  subscription: z.string().describe("The user's FCM registration token."),
});
export type SaveNotificationSubscriptionInput = z.infer<typeof SaveNotificationSubscriptionInputSchema>;

const SaveNotificationSubscriptionOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SaveNotificationSubscriptionOutput = z.infer<typeof SaveNotificationSubscriptionOutputSchema>;


const saveNotificationSubscriptionFlow = ai.defineFlow(
  {
    name: 'saveNotificationSubscriptionFlow',
    inputSchema: SaveNotificationSubscriptionInputSchema,
    outputSchema: SaveNotificationSubscriptionOutputSchema,
  },
  async ({ userId, subscription }) => {
    try {
      if (!userId || !subscription) {
        throw new Error("User ID and subscription token are required.");
      }
      
      // We are now saving the FCM token as the pushSubscription
      await saveUserProfile(userId, { pushSubscription: subscription } as any);

      return { success: true };
    } catch (error: any) {
      console.error('Error saving notification subscription:', error);
      return { success: false, error: error.message };
    }
  }
);

export async function saveNotificationSubscription(input: SaveNotificationSubscriptionInput): Promise<SaveNotificationSubscriptionOutput> {
    return await saveNotificationSubscriptionFlow(input);
}
