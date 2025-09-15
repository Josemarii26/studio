
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// This is the only file that should be importing from 'firebase-admin'

// --- Start of Validation Block ---
// Before doing anything, we check if the required environment variables are available.
// This is crucial for the build process in environments like Netlify.
if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    // If the variables are not set, we throw an error to stop the build process.
    // This gives us a clear and immediate signal about what is wrong.
    throw new Error(
        'Firebase server credentials are not set. Please check your environment variables (FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY) in your deployment settings.'
    );
}
// --- End of Validation Block ---

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Replace the escaped newlines in the private key with actual newlines
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

let app: App;

// Initialize the app only if it hasn't been initialized yet.
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
