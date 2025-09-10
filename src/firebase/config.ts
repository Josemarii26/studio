
// This configuration is now sourced from environment variables
// for better security and build-time configuration.
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  // This VAPID key is required for Web Push notifications.
  vapidKey: 'BGE1H8dY_Qc_h_j1A_E7p_q8R_y9Z_t_G7i_W2k_S_p8O_v_Y5k_C_v_H3o_R_y_W9j_L_n_B7f_C_x_E3r_Y_l_N_s'
};
