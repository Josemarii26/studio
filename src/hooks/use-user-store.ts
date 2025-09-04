
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { useAuth } from './use-auth';

// This hook now manages the user's *profile data*, which is separate from their *auth state*.
// The profile data is stored in localStorage, keyed by the user's UID.

export function useUserStore() {
  const { user } = useAuth();
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect to load profile from localStorage when user object changes
  useEffect(() => {
    if (user) {
      try {
        const item = window.localStorage.getItem(`userProfile-${user.uid}`);
        if (item) {
          setUserProfileState(JSON.parse(item));
        } else {
          // If no profile exists for this user, it means they need to go through onboarding.
          setUserProfileState(null);
        }
      } catch (error) {
        console.error("Failed to parse userProfile from localStorage", error);
        setUserProfileState(null); // Fallback to null on error
      } finally {
        setIsLoaded(true);
      }
    } else {
      // If there is no user, there's no profile to load.
      setUserProfileState(null);
      setIsLoaded(true);
    }
  }, [user]);

  // Function to save the profile to localStorage
  const setUserProfile = (profile: UserProfile | null) => {
    if (user) {
      try {
        if (profile) {
          window.localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(profile));
        } else {
          window.localStorage.removeItem(`userProfile-${user.uid}`);
        }
        setUserProfileState(profile);
      } catch (error) {
        console.error("Failed to save userProfile to localStorage", error);
      }
    } else {
        console.error("Cannot set user profile: no authenticated user.")
    }
  };

  return { userProfile, setUserProfile, isLoaded };
}
