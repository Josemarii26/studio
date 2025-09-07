
'use client';

import { NutriTrackLogo } from "./nutri-track-logo";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <NutriTrackLogo className="h-24 w-24 text-primary animate-stroke-draw" />
        <h1 className="text-2xl font-bold tracking-widest animate-typing">NutriTrackAI</h1>
      </div>
    </div>
  );
}
