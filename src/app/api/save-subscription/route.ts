
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAppInstance } from '@/firebase/server'; // Use our robust, centralized initializer
import { getFirestore, doc, updateDoc } from 'firebase-admin/firestore';

// The Firebase Admin SDK is initialized once in @/firebase/server.ts
// We just need to get the instance here.
const app = getAppInstance();
const db = getFirestore(app);

export async function POST(request: Request) {
  const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!authToken) {
    return new NextResponse('Unauthorized: No auth token provided', { status: 401 });
  }

  try {
    // Verify the user's identity using the auth token
    const decodedToken = await getAuth(app).verifyIdToken(authToken);
    const userId = decodedToken.uid;
    
    // Get the push subscription object from the request body
    const subscription = await request.json();

    if (!subscription) {
      return new NextResponse('Bad Request: Missing subscription data.', { status: 400 });
    }
    
    // Get a reference to the user's profile document
    const userProfileRef = doc(db, 'userProfiles', userId);
    
    // Update the document with the new push subscription
    await updateDoc(userProfileRef, { pushSubscription: subscription });
    
    console.log(`[API] Successfully saved push subscription for user: ${userId}`);
    return NextResponse.json({ success: true, message: 'Subscription saved successfully.' });

  } catch (error) {
    console.error('[API] Error in save-subscription:', error);

    // Handle specific auth errors
    if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/id-token-expired') {
            return new NextResponse('Unauthorized: Token expired', { status: 401 });
        }
        if (firebaseError.code === 'auth/argument-error') {
            return new NextResponse('Unauthorized: Invalid token', { status: 401 });
        }
    }
    
    // Generic server error for other cases
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
