
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
import type { DayData, ChatMessage } from '@/lib/types';
import { parseNutritionalAnalysis } from '@/lib/utils';
import { startOfToday, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { WalkthroughModal } from '@/components/walkthrough-modal';


function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
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
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);


  // Authentication and onboarding checks
  useEffect(() => {
    // Wait until both auth and profile are loaded
    if (authLoading || !profileLoaded) return;

    if (!user) {
      router.push('/login');
    } else if (!userProfile) {
      // Only redirect to onboarding if we are sure there is no profile
      router.push('/onboarding');
    }
  }, [user, userProfile, authLoading, profileLoaded, router]);


  // Check if walkthrough should be shown
  useEffect(() => {
    if (user) {
      const walkthroughKey = `walkthroughCompleted-${user.uid}`;
      const completed = localStorage.getItem(walkthroughKey);
      if (!completed) {
        setShowWalkthrough(true);
      }
    }
  }, [user]);

  const handleWalkthroughComplete = () => {
    if (user) {
        const walkthroughKey = `walkthroughCompleted-${user.uid}`;
        localStorage.setItem(walkthroughKey, 'true');
        setShowWalkthrough(false);
    }
  };


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
    
    // Check if parsing failed (indicated by 0 calories)
    if(parsedData.totals.calories === 0) {
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "I couldn't understand that. Please try rephrasing your meal description.",
        });
        // Add a system error message to the chat
        const errorMessage: ChatMessage = { 
            id: String(Date.now() + 1), 
            role: 'system', 
            content: 'Sorry, I couldn\'t analyze that. The format might be incorrect or missing details. Please try again.', 
            timestamp: new Date() 
        };
        setChatMessages(prev => [...prev, errorMessage]);
        return;
    }

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

    // Add successful analysis to chat
    const assistantMessage: ChatMessage = { id: String(Date.now() + 1), role: 'assistant', content: result.analysis, timestamp: new Date() };
    setChatMessages(prev => [...prev, assistantMessage]);
  };
  
  if (authLoading || !profileLoaded || isLoadingData) {
    return <DashboardLoader />;
  }

  // This second check handles the case where the redirect logic is running
  // but we don't want to flash the dashboard content.
  if (!user || !userProfile) {
    return <DashboardLoader />;
  }

  return (
    <SidebarProvider>
      <WalkthroughModal isOpen={showWalkthrough} onComplete={handleWalkthroughComplete} />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <HeaderWithSidebar />
        <div className="flex flex-1">
            <DashboardContent>
              <DashboardClient dailyData={dailyData} />
            </DashboardContent>
            <Sidebar side="right" className="border-l">
                <NutritionalChat 
                    onAnalysisUpdate={handleAnalysisUpdate} 
                    dailyData={dailyData}
                    messages={chatMessages}
                    setMessages={setChatMessages}
                />
            </Sidebar>
        </div>
      </div>
    </SidebarProvider>
  );
}

function HeaderWithSidebar() {
  const { toggleSidebar } = useSidebar();
  return <Header toggleSidebar={toggleSidebar} />
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
