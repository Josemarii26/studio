
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
import { loadDailyDataForUser, saveDailyDataForUser } from '@/firebase/firestore';
import type { DayData } from '@/lib/types';
import { parseNutritionalAnalysis } from '@/lib/utils';
import { startOfToday, isSameDay } from 'date-fns';


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
  const { isLoaded: profileLoaded, userProfile } = useUserStore();
  const router = useRouter();
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Authentication and onboarding checks
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profileLoaded && !userProfile) {
      router.push('/onboarding');
    }
  }, [user, authLoading, profileLoaded, userProfile, router]);


  // Load data from Firestore when the component mounts or user changes
  useEffect(() => {
    async function loadData() {
      if (user) {
        setIsLoadingData(true);
        const data = await loadDailyDataForUser(user.uid);
        setDailyData(data);
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [user]);

  
  // Save data to Firestore whenever it changes
  useEffect(() => {
    if (user && !isLoadingData) {
      saveDailyDataForUser(user.uid, dailyData);
    }
  }, [dailyData, user, isLoadingData]);
  

  const handleAnalysisUpdate = (result: { analysis: string, creatineTaken: boolean, proteinTaken: boolean }) => {
    if (!userProfile) return;

    const parsedData = parseNutritionalAnalysis(result.analysis, userProfile);
    const today = startOfToday();
    const newDayData: DayData = {
      date: today,
      ...parsedData,
      creatineTaken: result.creatineTaken,
      proteinTaken: result.proteinTaken,
    };
    
    setDailyData(prevData => {
        const otherDays = prevData.filter(d => !isSameDay(d.date, today));
        return [...otherDays, newDayData];
    });
  };
  
  if (authLoading || !profileLoaded || !userProfile || isLoadingData) {
    return <DashboardLoader />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <div className="flex flex-1">
            <DashboardContent>
              <DashboardClient dailyData={dailyData} setDailyData={setDailyData} />
            </DashboardContent>
            <Sidebar side="right" className="w-[400px] xl:w-[450px] border-l">
                <NutritionalChat onAnalysisUpdate={handleAnalysisUpdate} dailyData={dailyData} />
            </Sidebar>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
      <main className={cn("flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out", 
          open && "mr-[400px] xl:mr-[450px]"
      )}>
        {children}
      </main>
  )
}
