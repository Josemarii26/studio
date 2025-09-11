
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { firebaseAdminConfig } from '@/firebase/admin-config';
import { sendNotification } from '@/ai/flows/send-notification';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
}
const db = getFirestore();

export async function GET(request: Request) {
  // Simple cron job security
  if (request.headers.get('X-Appengine-Cron') !== 'true') {
     return new NextResponse('Forbidden', { status: 403 });
  }
  
  try {
    const profilesRef = collection(db, 'userProfiles');
    const q = query(profilesRef, where('pushSubscription', '!=', null));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ success: true, message: 'No users with subscriptions to notify.' });
    }

    const notificationsPromises = querySnapshot.docs.map(doc => {
      const userProfile = doc.data();
      return sendNotification({
        subscription: userProfile.pushSubscription,
        title: 'Your Daily Reminder',
        body: 'Don\'t forget to log your meals for today!',
      });
    });

    await Promise.all(notificationsPromises);

    return NextResponse.json({ success: true, message: `${querySnapshot.size} reminders sent.` });
    
  } catch (error) {
    console.error('Error sending reminders:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
