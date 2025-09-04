
'use client';

import { useState, useEffect } from 'react';
import { NutritionalChat } from '@/components/nutritional-chat';
import { NutriTrackLogo } from '@/components/nutri-track-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogOut } from 'lucide-react';
import { SidebarProvider, Sidebar, useSidebar } from '@/components/ui/sidebar';
import { DashboardClient } from '@/components/dashboard-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUserStore } from '@/hooks/use-user-store';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { DashboardLoader } from '@/components/dashboard-loader';

function Header() {
  const { toggleSidebar } = useSidebar();
  const { userProfile, isLoaded: isProfileLoaded } = useUserStore();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-sm"
    )}>
      <div className={cn(
        "flex h-full items-center justify-between gap-4 px-4 sm:px-6"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <NutriTrackLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            NutriTrackAI
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={toggleSidebar}>
              <MessageSquare className="mr-2" />
              Chat
          </Button>
          {isProfileLoaded && userProfile && (
             <div className="flex items-center gap-4">
                <Link href="/profile">
                  <Avatar className="cursor-pointer">
                      <AvatarImage src={userProfile.photoUrl || ''} data-ai-hint="person face" />
                      <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAnalysisUpdate = (data: any) => {
    // In a real app, this would update a global state or database
    console.log('New analysis data:', data);
    setAnalysisData(data);
  };
  
  if (authLoading || !user) {
    return <DashboardLoader />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
            <DashboardContent onAnalysisUpdate={handleAnalysisUpdate} />
            <Sidebar side="right" className="w-[400px] xl:w-[450px] border-l mt-16">
                <NutritionalChat onAnalysisUpdate={handleAnalysisUpdate} />
            </Sidebar>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardContent({ onAnalysisUpdate }: { onAnalysisUpdate: (data: any) => void; }) {
  const { open } = useSidebar();
  return (
      <main className={cn("flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out", 
          open && "mr-[400px] xl:mr-[450px]"
      )}>
        <DashboardClient onAnalysisUpdate={onAnalysisUpdate} />
      </main>
  )
}
