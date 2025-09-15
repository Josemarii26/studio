
// This configuration is used for the Firebase Admin SDK (server-side).
export const firebaseAdminConfig = {
  // For server-side code, we read from a variable WITHOUT the NEXT_PUBLIC_ prefix.
  // This is the core fix for the "undefined" project ID issue.
  projectId: process.env.FIREBASE_PROJECT_ID, 
  
  // These remain the same.
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  
  // The private key requires special handling to replace the escaped newline characters.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};
