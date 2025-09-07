
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


  // Authentication and onboarding checks. This is the new, more robust logic.
  useEffect(() => {
    // Wait until both auth and profile are definitively loaded before doing anything.
    if (authLoading || !profileLoaded) {
      return;
    }

    // Now that we're sure loading is complete, we can make routing decisions.
    if (!user) {
      // If there's no user, send to login.
      router.push('/login');
    } else if (!userProfile) {
      // If there is a user, but no profile, send to onboarding.
      router.push('/onboarding');
    } else {
        // If we have a user and a profile, check if they need the walkthrough.
        const walkthroughKey = `walkthroughCompleted-${user.uid}`;
        const completed = localStorage.getItem(walkthroughKey);
        if (!completed) {
            setShowWalkthrough(true);
        }
    }
  }, [user, userProfile, authLoading, profileLoaded, router]);


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
      // Only load data if we have a confirmed user with a profile
      if (user && userProfile) {
        setIsLoadingData(true);
        const data = await loadDailyDataForUser(user.uid);
        setDailyData(data);
        setIsLoadingData(false);
      } else if (!user && !authLoading) {
        // If there's no user and auth is done, no data to load.
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [user, userProfile, authLoading]);

  
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
  
  // This is the primary loading gate for the entire page. It prevents any rendering
  // until we know for sure the user's auth and profile state.
  if (authLoading || !profileLoaded || isLoadingData) {
    return <DashboardLoader />;
  }

  // This second check handles the case where the redirect logic from the useEffect is running.
  // We don't want to flash the dashboard content before the redirect happens.
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

    