
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

let app: App;

// Check if the environment variable is set.
if (!process.env.FIREBASE_ADMIN_CREDENTIALS_JSON) {
  throw new Error(
    'FATAL: FIREBASE_ADMIN_CREDENTIALS_JSON environment variable is not set. Please download your service account JSON from Firebase and set it.'
  );
}

// Parse the JSON credentials from the environment variable.
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS_JSON);

// Initialize the Firebase Admin SDK.
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('[Firebase Server] Admin SDK initialized successfully.');
} else {
  app = getApps()[0]; // Get the already initialized app
  console.log('[Firebase Server] Using existing Admin SDK instance.');
}

export const getAppInstance = () => app;
