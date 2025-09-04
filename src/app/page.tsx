
'use client';

import { useState } from 'react';
import { DashboardGrid } from '@/components/dashboard-grid';
import { NutritionalChat } from '@/components/nutritional-chat';
import { NutriTrackLogo } from '@/components/nutri-track-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { SidebarProvider, Sidebar, useSidebar } from '@/components/ui/sidebar';
import { DashboardClient } from '@/components/dashboard-client';

function Header() {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <a href="/" className="flex items-center gap-2">
        <NutriTrackLogo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground font-headline">
          NutriTrackAI
        </h1>
      </a>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={toggleSidebar}>
            <MessageSquare className="mr-2" />
            Chat
        </Button>
        <a href="/onboarding">
          <Avatar className="cursor-pointer">
              <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person face" className="animated-image" />
              <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </a>
      </div>
    </header>
  );
}


export default function Home() {
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysisUpdate = (data: any) => {
    // In a real app, this would update a global state or database
    console.log('New analysis data:', data);
    setAnalysisData(data);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
            <Sidebar side="right" className="w-[400px] xl:w-[450px]">
                <NutritionalChat onAnalysisUpdate={handleAnalysisUpdate} />
            </Sidebar>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <div className="space-y-8">
                <DashboardClient onAnalysisUpdate={handleAnalysisUpdate} />
                <DashboardGrid />
              </div>
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
