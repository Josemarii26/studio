
'use server';

import { sendNotification } from '@/ai/actions/send-notification';
import { loadUserProfile } from '@/firebase/firestore';
import { getTranslations } from '@/locales/server';

export async function sendDashboardNotification(props: { userId: string }) {
  'use server';

  console.log(`[Flow] sendDashboardNotification called for userId: ${props.userId}`);

  const userProfile = await loadUserProfile(props.userId);

  if (!userProfile) {
    console.error('[Flow] User profile not found.');
    return { success: false, message: 'User profile not found.' };
  }

  if (!userProfile.pushSubscription) {
    console.warn('[Flow] User has no push subscription.');
    return { success: false, message: 'User has no push subscription.' };
  }

  try {
    const t = await getTranslations('es'); // We'll just use a fixed language for this test
    
    await sendNotification(
      userProfile.pushSubscription,
      t('dashboard.notification-title'),
      t('dashboard.notification-body'),
      '/'
    );

    console.log('[Flow] Test notification sent successfully.');
    return { success: true, message: 'Test notification sent.' };
  } catch (error: any) {
    console.error('[Flow] Error sending test notification:', error);
    return { success: false, message: error.message || 'Failed to send notification.' };
  }
}
