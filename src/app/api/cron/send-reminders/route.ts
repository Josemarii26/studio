
import { NextResponse, type NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
import webpush, { type PushSubscription } from 'web-push';
import { vapidKeys } from '@/firebase/vapid-keys';

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
    // Configure web-push with VAPID details
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // This should be a valid email
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }

    const db = admin.firestore();
    const usersSnapshot = await db.collection('userProfiles').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found.');
      return NextResponse.json({ success: true, message: 'No users to notify.' });
    }

    const notificationPayload = JSON.stringify({
      title: "🍽️ Hora de registrar tu día",
      body: "No te olvides de anotar tus comidas de hoy para seguir tu progreso. ¡Un pequeño paso para un gran resultado!",
      icon: 'https://www.dietlog-ai.site/icons/icon-192x192.png',
      badge: 'https://www.dietlog-ai.site/icons/icon-72x72.png'
    });

    const notificationPromises: Promise<any>[] = [];

    usersSnapshot.forEach(doc => {
      const userProfile = doc.data();
      if (userProfile.pushSubscription) {
        const subscription = userProfile.pushSubscription as PushSubscription;
        console.log(`Queueing notification for user ${doc.id}`);
        notificationPromises.push(
          webpush.sendNotification(subscription, notificationPayload)
            .catch(error => {
              console.error(`Error sending notification to user ${doc.id}:`, error);
              // Handle expired or invalid subscriptions
              if (error.statusCode === 404 || error.statusCode === 410) {
                console.log(`Subscription for user ${doc.id} has expired or is invalid. Removing.`);
                // Remove the subscription from the user's profile
                return doc.ref.update({ pushSubscription: null });
              }
            })
        );
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`Successfully sent or attempted to send notifications to ${notificationPromises.length} users.`);
    return NextResponse.json({ success: true, message: `Attempted to send notifications to ${notificationPromises.length} users.` });

  } catch (error) {
    console.error('Error in cron job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, message: 'Cron job failed', error: errorMessage }, { status: 500 });
  }
}
