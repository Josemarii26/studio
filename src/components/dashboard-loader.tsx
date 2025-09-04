
'use client';
import { NutriTrackLogo } from '@/components/nutri-track-logo';

export function DashboardLoader() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <NutriTrackLogo className="h-16 w-16 animate-pulse text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
