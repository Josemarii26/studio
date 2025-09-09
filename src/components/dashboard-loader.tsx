
'use client';
import { DietLogAILogo } from '@/components/diet-log-ai-logo';

export function DashboardLoader() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <DietLogAILogo className="h-16 w-16 animate-grow-and-breathe text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
