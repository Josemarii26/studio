
'use server';

import { getAppInstance } from './server';
import { getFirestore } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/types';

// Initialize the Admin Firestore instance
const adminDb = getFirestore(getAppInstance());

/**
 * Loads a user's profile from Firestore using the Admin SDK.
 * Intended for server-side use only (e.g., in API routes, server actions, flows).
 * @param userId The UID of the user.
 * @returns The UserProfile object or null if not found.
 */
export const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const docRef = adminDb.collection('userProfiles').doc(userId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log(`[Admin Firestore] Profile for user ${userId} not found.`);
            return null;
        }

        // The data is directly usable, assuming the structure matches the UserProfile type.
        // Firestore Admin SDK handles Timestamps differently, but for the profile, it should be fine.
        return docSnap.data() as UserProfile;

    } catch (error) {
        console.error("[Admin Firestore] Error loading user profile:", error);
        // Return null to ensure consistent error handling with the client-side function.
        return null;
    }
}
