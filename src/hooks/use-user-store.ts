
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';

// Mock data to be used as a fallback if no profile is in localStorage
const mockUserProfile: UserProfile = {
  name: 'Alex Doe',
  age: 30,
  gender: 'male',
  weight: 80,
  height: 180,
  goalWeight: 75,
  activityLevel: 'moderate',
  goal: 'lose',
  dailyCalorieGoal: 2200,
  dailyProteinGoal: 150,
  dailyFatGoal: 70,
  dailyCarbsGoal: 250,
  bmi: 24.7,
  photoUrl: null,
};


export function useUserStore() {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('userProfile');
      if (item) {
        setUserProfileState(JSON.parse(item));
      } else {
        // If no user profile, maybe set a default or leave as null
        // For development, we can fall back to mock data
        setUserProfileState(mockUserProfile); 
      }
    } catch (error) {
      console.error("Failed to parse userProfile from localStorage", error);
      // Fallback to mock data in case of parsing error
      setUserProfileState(mockUserProfile);
    } finally {
        // Add a small delay to show the loader
        setTimeout(() => setIsLoaded(true), 500);
    }
  }, []);

  const setUserProfile = (profile: UserProfile | null) => {
    try {
      if (profile) {
        window.localStorage.setItem('userProfile', JSON.stringify(profile));
      } else {
        window.localStorage.removeItem('userProfile');
      }
      setUserProfileState(profile);
    } catch (error) {
      console.error("Failed to save userProfile to localStorage", error);
    }
  };

  return { userProfile, setUserProfile, isLoaded };
}
