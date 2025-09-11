'use server';
/**
 * @fileOverview A server-side flow for saving a user's push notification subscription token.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { saveUserProfile } from '@/firebase/firestore';

export const SaveNotificationSubscriptionInputSchema = z.object({
  userId: z.string().describe('The UID of the user.'),
  subscriptionToken: z.string().describe("The user's FCM push subscription token."),
});
export type SaveNotificationSubscriptionInput = z.infer<typeof SaveNotificationSubscriptionInputSchema>;

export const SaveNotificationSubscriptionOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SaveNotificationSubscriptionOutput = z.infer<typeof SaveNotificationSubscriptionOutputSchema>;


export const saveNotificationSubscriptionFlow = ai.defineFlow(
  {
    name: 'saveNotificationSubscriptionFlow',
    inputSchema: SaveNotificationSubscriptionInputSchema,
    outputSchema: SaveNotificationSubscriptionOutputSchema,
  },
  async ({ userId, subscriptionToken }) => {
    try {
      if (!userId || !subscriptionToken) {
        throw new Error("User ID and subscription token are required.");
      }
      // The `as any` is a small concession to add a non-standard property.
      await saveUserProfile(userId, { pushSubscription: subscriptionToken } as any);

      return { success: true };
    } catch (error: any) {
      console.error('Error saving notification subscription:', error);
      return { success: false, error: error.message };
    }
  }
);

// This is the server action that the client will call.
export async function saveNotificationSubscription(input: SaveNotificationSubscriptionInput): Promise<SaveNotificationSubscriptionOutput> {
    return await saveNotificationSubscriptionFlow(input);
}
