
'use server';

import { sendNotification } from '@/ai/actions/send-notification';
import { loadUserProfile } from '@/firebase/admin-firestore';
import { firebaseAdminConfig } from '@/firebase/admin-config'; // Import the config object directly

export async function sendDashboardNotification(props: { userId: string }) {
  'use server';

  // --- AGGRESSIVE DIAGNOSTIC STEP ---
  // Log all the server-side environment variables as the server sees them.
  console.log('--- Aggressive Server-Side Config Diagnosis ---');
  console.log(`[DIAGNOSTIC] Project ID: ${firebaseAdminConfig.projectId}`);
  console.log(`[DIAGNOSTIC] Client Email: ${firebaseAdminConfig.clientEmail}`);
  console.log(`[DIAGNOSTIC] Private Key exists: ${!!firebaseAdminConfig.privateKey}`);
  console.log('---------------------------------------------');
  // --- END DIAGNOSTIC ---

  console.log(`[Flow] sendDashboardNotification called for userId: ${props.userId}`);

  // If the projectId is undefined, the app will fail to initialize. We can exit early.
  if (!firebaseAdminConfig.projectId) {
    console.error('[Flow] Halting execution: Firebase Project ID is undefined. Check Netlify environment variables.');
    return { success: false, message: 'Server configuration error: Project ID missing.' };
  }

  const userProfile = await loadUserProfile(props.userId);

  if (!userProfile) {
    console.error(`[Flow] User profile not found for userId: ${props.userId}. This is expected if the Project ID is wrong.`);
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
