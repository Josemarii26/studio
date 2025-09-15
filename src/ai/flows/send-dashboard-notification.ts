
'use server';

import { sendNotification } from '@/ai/actions/send-notification';

// WARNING: This is a temporary diagnostic file.
export async function sendDashboardNotification(props: { userId: string }) {
  'use server';

  console.log(`[Flow] (DIAGNOSTIC) Bypassing database and using hardcoded token for user: ${props.userId}`);

  // This is a temporary, hardcoded subscription object using the token from the browser logs.
  const hardcodedSubscription = {
    // The endpoint and keys are not needed for the server-side FCM call,
    // only the token is required.
    token: "cx2NZQF8IIYMtDwTKN5bkZ:APA91bF42aZH9Xh66yqGcBTH57M_WuM2aFn6tE8JY7gGW1XYQUwptBOZj2HDbN_X8k9Kj3ijHAgNIiFia5jut1tsop-oGp2eNtxluRhb39KdLX7RmvCi7I4",
  };

  try {
    // We are directly calling the notification action with the hardcoded object.
    await sendNotification(
      hardcodedSubscription,
      '¡Prueba Definitiva!', // Title
      'Si recibes esto, la conexión es un éxito.', // Body
      '/' // URL to open on click
    );

    console.log('[Flow] (DIAGNOSTIC) Hardcoded notification sent successfully.');
    return { success: true, message: 'Hardcoded notification sent.' };

  } catch (error: any) {
    console.error('[Flow] (DIAGNOSTIC) Error sending hardcoded notification:', error);
    // It's very important to see server-side errors if this fails.
    return { success: false, message: error.message || 'Failed to send hardcoded notification.' };
  }
}
