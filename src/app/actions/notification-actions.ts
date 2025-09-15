
'use server';

import { sendWelcomeNotificationFlow } from '@/ai/flows/send-welcome-notification';
import type { SendWelcomeNotificationInput } from '@/ai/flows/send-welcome-notification';

/**
 * This is a server action that can be safely called from client components.
 * It acts as a bridge to the underlying Genkit flow.
 */
export async function sendWelcomeNotificationAction(input: SendWelcomeNotificationInput): Promise<{ success: boolean; message: string; }> {
    console.log('[Action] Calling sendWelcomeNotificationFlow');
    try {
        const result = await sendWelcomeNotificationFlow(input);
        return result;
    } catch (error: any) {
        console.error('[Action] Error calling flow:', error);
        // In production, Next.js might hide the original error message.
        // We return a generic but identifiable error.
        return { success: false, message: 'Server action failed to execute the flow.' };
    }
}
