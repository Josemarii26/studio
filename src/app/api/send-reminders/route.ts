
import { NextResponse } from 'next/server';
import { getAppInstance } from '@/firebase/server'; // Use our robust, centralized initializer
import { getFirestore, collection, getDocs, query, where } from 'firebase-admin/firestore';
// Correctly import the action, not a flow
import { sendNotification } from '@/ai/actions/send-notification'; 

// The Firebase Admin SDK is initialized once in @/firebase/server.ts
const app = getAppInstance();
const db = getFirestore(app);

export async function GET(request: Request) {
  // Simple cron job security (ensure this header is sent by your cron job provider)
  if (request.headers.get('X-Appengine-Cron') !== 'true') {
     console.warn('[API] send-reminders call rejected due to missing X-Appengine-Cron header.');
     return new NextResponse('Forbidden', { status: 403 });
  }

  console.log('[API] send-reminders job started.');

  try {
    const profilesRef = collection(db, 'userProfiles');
    // Find all users who have a push subscription
    const q = query(profilesRef, where('pushSubscription', '!=', null));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('[API] No users with subscriptions to notify.');
      return NextResponse.json({ success: true, message: 'No users with subscriptions to notify.' });
    }

    console.log(`[API] Found ${querySnapshot.size} users with subscriptions.`);

    // Create a list of promises for all the notification sending operations
    const notificationPromises = querySnapshot.docs.map(doc => {
      const userProfile = doc.data();

      if (userProfile.pushSubscription) {
          // Correctly call the sendNotification action with the right arguments
          return sendNotification(
            userProfile.pushSubscription,
            'Your Daily Reminder', 
            'Don\'t forget to log your meals for today!',
            '/' // URL to open on click
          );
      }
      return Promise.resolve(); // Resolve for users without a subscription object
    });

    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);

    console.log(`[API] ${querySnapshot.size} reminders sent successfully.`);
    return NextResponse.json({ success: true, message: `${querySnapshot.size} reminders sent.` });
    
  } catch (error) {
    console.error('[API] Error in send-reminders job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
