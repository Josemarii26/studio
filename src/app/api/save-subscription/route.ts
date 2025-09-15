
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAppInstance } from '@/firebase/server';
// Import setDoc instead of updateDoc
import { getFirestore, doc, setDoc } from 'firebase-admin/firestore';

const app = getAppInstance();
const db = getFirestore(app);

export async function POST(request: Request) {
  const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!authToken) {
    return new NextResponse('Unauthorized: No auth token provided', { status: 401 });
  }

  try {
    const decodedToken = await getAuth(app).verifyIdToken(authToken);
    const userId = decodedToken.uid;
    const subscription = await request.json();

    if (!subscription) {
      return new NextResponse('Bad Request: Missing subscription data.', { status: 400 });
    }
    
    const userProfileRef = doc(db, 'userProfiles', userId);
    
    // Use setDoc with { merge: true }.
    // This will create the document if it doesn't exist, or merge the data if it does.
    // This is the robust solution to the 'User profile not found' error.
    await setDoc(userProfileRef, { pushSubscription: subscription }, { merge: true });
    
    console.log(`[API] Successfully created/updated profile and saved subscription for user: ${userId}`);
    return NextResponse.json({ success: true, message: 'Subscription saved successfully.' });

  } catch (error) {
    console.error('[API] Error in save-subscription:', error);

    if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/id-token-expired') {
            return new NextResponse('Unauthorized: Token expired', { status: 401 });
        }
        if (firebaseError.code === 'auth/argument-error') {
            return new NextResponse('Unauthorized: Invalid token', { status: 401 });
        }
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
