
import { NextResponse, type NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
import { sendNotification } from '@/ai/flows/send-notification';

// Prevent caching of this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Secure the endpoint with a secret key from environment variables
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (process.env.NODE_ENV === 'production' && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    }

    const db = admin.firestore();
    const usersSnapshot = await db.collection('userProfiles').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found.');
      return NextResponse.json({ success: true, message: 'No users to notify.' });
    }

    const notificationPromises: Promise<void>[] = [];
    const notificationTitle = "🍽️ Hora de registrar tu día";
    const notificationBody = "No te olvides de anotar tus comidas de hoy para seguir tu progreso. ¡Un pequeño paso para un gran resultado!";

    usersSnapshot.forEach(doc => {
      const userProfile = doc.data();
      if (userProfile.fcmToken) {
        console.log(`Queueing notification for user ${doc.id}`);
        notificationPromises.push(
          sendNotification({
            token: userProfile.fcmToken,
            title: notificationTitle,
            body: notificationBody,
          })
        );
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`Successfully sent notifications to ${notificationPromises.length} users.`);
    return NextResponse.json({ success: true, message: `Sent notifications to ${notificationPromises.length} users.` });

  } catch (error) {
    console.error('Error in cron job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, message: 'Cron job failed', error: errorMessage }, { status: 500 });
  }
}
