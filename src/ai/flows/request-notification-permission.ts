'use client';
/**
 * @fileOverview A client-side flow for requesting notification permissions and saving the token.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFCMToken } from '@/firebase/client';
import { saveUserProfile } from '@/firebase/firestore';


export const RequestNotificationPermissionInputSchema = z.object({
  userId: z.string().describe('The UID of the user.'),
  idToken: z.string().describe('The Firebase auth ID token for the user.'),
  vapidKey: z.string().describe("The VAPID public key for web push notifications.")
});
export type RequestNotificationPermissionInput = z.infer<typeof RequestNotificationPermissionInputSchema>;

export const RequestNotificationPermissionOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type RequestNotificationPermissionOutput = z.infer<typeof RequestNotificationPermissionOutputSchema>;


export const requestNotificationPermissionFlow = ai.defineFlow(
  {
    name: 'requestNotificationPermissionFlow',
    inputSchema: RequestNotificationPermissionInputSchema,
    outputSchema: RequestNotificationPermissionOutputSchema,
  },
  async ({ userId, vapidKey }) => {
    try {
      const fcmToken = await getFCMToken(vapidKey);
      
      if (!fcmToken) {
        throw new Error("Permission not granted or token could not be retrieved.");
      }

      await saveUserProfile(userId, { pushSubscription: fcmToken } as any);

      return { success: true };
    } catch (error: any) {
      console.error('Error during notification permission flow:', error);
      return { success: false, error: error.message };
    }
  }
);

export async function requestNotificationPermission(input: RequestNotificationPermissionInput): Promise<RequestNotificationPermissionOutput> {
    return await requestNotificationPermissionFlow(input);
}
