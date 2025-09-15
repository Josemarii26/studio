
'use server';

import { sendNotification } from '@/ai/actions/send-notification';
// Correctly import the admin version of loadUserProfile
import { loadUserProfile } from '@/firebase/admin-firestore';

export async function sendDashboardNotification(props: { userId: string }) {
  'use server';

  console.log(`[Flow] sendDashboardNotification called for userId: ${props.userId}`);

  // This now calls the server-side function
  const userProfile = await loadUserProfile(props.userId);

  if (!userProfile) {
    console.error('[Flow] User profile not found (admin check).');
    return { success: false, message: 'User profile not found.' };
  }

  if (!userProfile.pushSubscription) {
    console.warn('[Flow] User has no push subscription.');
    return { success: false, message: 'User has no push subscription.' };
  }

  try {
    // Remove the translation logic and use a simple hardcoded message for the test
    await sendNotification(
      userProfile.pushSubscription,
      'Test Notification', // Simple title
      'This is a test notification from the dashboard!', // Simple body
      '/'
    );

    console.log('[Flow] Test notification sent successfully.');
    return { success: true, message: 'Test notification sent.' };

  } catch (error: any) {
    console.error('[Flow] Error sending test notification:', error);
    return { success: false, message: error.message || 'Failed to send notification.' };
  }
}
