
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { useAuth } from './use-auth';
import { loadUserProfile, saveUserProfile } from '@/firebase/firestore';

// This hook now manages the user's *profile data*, which is separate from their *auth state*.
// The profile data is now fetched from and saved to Firestore.

export function useUserStore() {
  const { user } = useAuth();
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect to load profile from Firestore when user object changes
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoaded(false); // Start loading
        try {
          const profile = await loadUserProfile(user.uid);
          setUserProfileState(profile);
        } catch (error) {
          console.error("Failed to load userProfile from Firestore", error);
          setUserProfileState(null); // Fallback to null on error
        } finally {
          setIsLoaded(true); // Finish loading
        }
      } else {
        // If there is no user, there's no profile to load.
        setUserProfileState(null);
        setIsLoaded(true);
      }
    };
    
    loadProfile();
  }, [user]);

  // Function to save the profile to Firestore
  const setUserProfile = useCallback(async (profile: UserProfile | null) => {
    if (user && profile) {
      try {
        await saveUserProfile(user.uid, profile);
        setUserProfileState(profile);
      } catch (error) {
        console.error("Failed to save userProfile to Firestore", error);
      }
    } else if (user && !profile) {
        // Handle profile deletion if needed, though not a current feature.
        // For now, we'll just clear the state.
        setUserProfileState(null);
    } else {
        console.error("Cannot set user profile: no authenticated user.")
    }
  }, [user]);

  return { userProfile, setUserProfile, isLoaded };
}
