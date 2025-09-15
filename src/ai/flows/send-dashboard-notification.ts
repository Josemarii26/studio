
'use server';

import { sendNotification } from '@/lib/server/notifications';
import { loadUserProfile } from '@/firebase/admin-firestore';

/**
 * This server action is a test utility for the dashboard.
 * It loads a user's profile and sends them a test notification.
 */
export async function sendDashboardNotification(props: { userId: string }) {
  'use server';

  console.log(`[Flow] Dashboard test notification flow started for userId: ${props.userId}`);

  const userProfile = await loadUserProfile(props.userId);

  if (!userProfile) {
    console.error(`[Flow] User profile not found for userId: ${props.userId}.`);
    // The frontend will receive this specific message and know the cause.
    return { success: false, message: 'User profile not found.' };
  }

  if (!userProfile.pushSubscription) {
    console.warn('[Flow] User has no push subscription in their profile.');
    return { success: false, message: 'User has no push subscription.' };
  }

  try {
    await sendNotification(
      userProfile.pushSubscription,
      'Test Notification',
      'This is a test notification from the dashboard!',
      '/' // Link to the root of the site
    );

    console.log('[Flow] Test notification sent successfully.');
    return { success: true, message: 'Test notification sent.' };

  } catch (error: any) {
    console.error('[Flow] Error sending test notification:', error);
    return { success: false, message: error.message || 'Failed to send notification.' };
  }
}
