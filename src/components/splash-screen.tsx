
'use client';

import { NutriTrackLogo } from "./nutri-track-logo";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full bg-primary/10 animate-pulse-ring"></div>
        <NutriTrackLogo className="h-20 w-20 text-primary animate-fade-in-up" />
      </div>
    </div>
  );
}
