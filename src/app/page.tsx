'use client';
import { DashboardClient } from '@/components/dashboard-client';
import { NutritionalChat } from '@/components/nutritional-chat';
import { NutriTrackLogo } from '@/components/nutri-track-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function Home() {
  const handleAnalysisUpdate = (data: any) => {
    // In a real app, this would update a global state or database
    console.log('New analysis data:', data);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <NutriTrackLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            NutriTrackAI
          </h1>
        </a>
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Chat</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md p-0">
              <NutritionalChat onAnalysisUpdate={handleAnalysisUpdate} />
            </SheetContent>
          </Sheet>
          <Avatar className="cursor-pointer">
            <a href="/onboarding">
              <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person face" />
              <AvatarFallback>U</AvatarFallback>
            </a>
          </Avatar>
        </div>
      </header>
      <main className="flex flex-1">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient onAnalysisUpdate={handleAnalysisUpdate} />
        </div>
        <aside className="hidden w-[400px] flex-shrink-0 border-l xl:w-[450px] md:block">
          <NutritionalChat onAnalysisUpdate={handleAnalysisUpdate} />
        </aside>
      </main>
    </div>
  );
}
