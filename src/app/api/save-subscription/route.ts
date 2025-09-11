
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { doc, getFirestore, updateDoc } from 'firebase-admin/firestore';
import { firebaseAdminConfig } from '@/firebase/admin-config';

// Initialize Firebase Admin SDK only if all credentials are provided
if (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
) {
    if (!getApps().length) {
        initializeApp(firebaseAdminConfig);
    }
}

export async function POST(request: Request) {
  // Check if the app is initialized before proceeding
  if (!getApps().length) {
    console.error('Firebase Admin SDK is not initialized. Missing credentials.');
    return new NextResponse('Internal Server Error: Firebase not configured', { status: 500 });
  }

  const db = getFirestore();
  const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
  if (!authToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(authToken);
    const userId = decodedToken.uid;
    const subscription = await request.json();

    if (!userId || !subscription) {
      return new NextResponse('Bad Request: Missing user ID or subscription.', { status: 400 });
    }
    
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, { pushSubscription: subscription });
    
    return NextResponse.json({ success: true, message: 'Subscription saved.' });

  } catch (error) {
    console.error('Error verifying auth token or saving subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
