
import { NextResponse, type NextRequest } from 'next/server';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, subscription } = await request.json();

    if (!userId || !subscription) {
      return NextResponse.json({ success: false, message: 'Missing userId or subscription.' }, { status: 400 });
    }

    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }

    const db = admin.firestore();
    const userProfileRef = db.collection('userProfiles').doc(userId);

    // Save the subscription object to the user's profile
    await userProfileRef.update({
      pushSubscription: subscription,
    });

    return NextResponse.json({ success: true, message: 'Subscription saved.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, message: 'Failed to save subscription', error: errorMessage }, { status: 500 });
  }
}
