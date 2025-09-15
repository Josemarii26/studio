
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// This is the only file that should be importing from 'firebase-admin'

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Replace the escaped newlines in the private key with actual newlines
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let app: App;

if (getApps().length === 0) {
    app = initializeApp({
        credential: credential.cert(serviceAccount),
    });
} else {
    app = getApp();
}

/**
 * Returns the initialized Firebase Admin App.
 */
export const getAppInstance = () => app;
