
'use client';

import { NutriTrackLogo } from "./nutri-track-logo";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 overflow-hidden animate-fade-out">
      <div className="flex flex-col items-center gap-4 animate-zoom-in-out pt-[50px]">
        <NutriTrackLogo className="h-24 w-24 text-primary" />
        <h1 className="text-2xl font-bold tracking-widest text-foreground">NutriTrackAI</h1>
      </div>
    </div>
  );
}
