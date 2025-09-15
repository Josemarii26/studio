
'use server';

import { sendNotification } from '@/ai/actions/send-notification';
import { loadUserProfile } from '@/firebase/admin-firestore';
import { getAppInstance } from '@/firebase/server'; // Import the app instance getter

export async function sendDashboardNotification(props: { userId: string }) {
  'use server';

  // --- DIAGNOSTIC STEP ---
  // Get the initialized Firebase app instance and log which project it's connected to.
  const app = getAppInstance();
  const projectId = app.options.projectId;
  console.log(`[Flow] DIAGNOSTIC: Server is connected to Firebase project: ${projectId}`);
  // --- END DIAGNOSTIC ---

  console.log(`[Flow] sendDashboardNotification called for userId: ${props.userId}`);

  const userProfile = await loadUserProfile(props.userId);

  if (!userProfile) {
    // We now know this fails because the project ID above is likely wrong.
    console.error(`[Flow] User profile not found for userId: ${props.userId}. Check if the server project ID matches the database.`);
    return { success: false, message: 'User profile not found.' };
  }

  if (!userProfile.pushSubscription) {
    console.warn('[Flow] User has no push subscription.');
    return { success: false, message: 'User has no push subscription.' };
  }

  try {
    await sendNotification(
      userProfile.pushSubscription,
      'Test Notification',
      'This is a test notification from the dashboard!',
      '/'
    );

    console.log('[Flow] Test notification sent successfully.');
    return { success: true, message: 'Test notification sent.' };

  } catch (error: any) {
    console.error('[Flow] Error sending test notification:', error);
    return { success: false, message: error.message || 'Failed to send notification.' };
  }
}
