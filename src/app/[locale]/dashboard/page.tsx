
'use client';

import { useState, useEffect } from 'react';
import { NutritionalChat } from '@/components/nutritional-chat';
import { DietLogAILogo } from '@/components/diet-log-ai-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogOut, MailWarning, ShieldCheck } from 'lucide-react';
import { SidebarProvider, Sidebar, useSidebar } from '@/components/ui/sidebar';
import { DashboardClient } from '@/components/dashboard-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUserStore } from '@/hooks/use-user-store';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { DashboardLoader } from '@/components/dashboard-loader';
import { loadDailyDataForUser, saveDailyDataForUser } from '@/firebase/firestore';
import type { DayData, ChatMessage, UserProfile } from '@/lib/types';
import { NutritionalChatAnalysisOutput } from '@/ai/flows/nutritional-chat-analysis';
import { startOfToday, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { WalkthroughModal } from '@/components/walkthrough-modal';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useNotifications } from '@/hooks/use-notifications';

function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { userProfile, isLoaded: isProfileLoaded } = useUserStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const t = useI18n();
  const locale = useCurrentLocale();

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-sm"
    )}>
      <div className={cn(
        "flex h-full items-center justify-between gap-4 px-4 sm:px-6"
      )}>
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <DietLogAILogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline hidden sm:block">
            DietLogAI
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={toggleSidebar}>
              <MessageSquare className="mr-2" />
              {t('dashboard.header-chat-btn')}
          </Button>
          <LanguageSwitcher />
          {isProfileLoaded && userProfile && (
             <div className="flex items-center gap-4">
                <Link href={`/${locale}/profile`}>
                  <Avatar className="cursor-pointer">
                      <AvatarImage src={userProfile.photoUrl || ''} data-ai-hint="person face" />
                      <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label={t('dashboard.header-signout-btn')}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function EmailVerificationGate() {
    const { signOut } = useAuth();
    const router = useRouter();
    const locale = useCurrentLocale();
    const t = useI18n();

    const handleSignOut = async () => {
        await signOut();
        router.push(`/${locale}/login`);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 text-center">
            <div className="space-y-4">
                <MailWarning className="mx-auto h-16 w-16 text-primary" />
                <h1 className="text-3xl font-bold font-headline">{t('auth.verify-title')}</h1>
                <p className="max-w-md text-muted-foreground">
                    {t('auth.verify-desc')}
                </p>
                <p className="text-sm text-muted-foreground">{t('auth.verify-spam')}</p>
                <Button onClick={handleSignOut}>{t('auth.verify-logout-btn')}</Button>
            </div>
        </div>
    )
}

function getDayStatus(totals: DayData['totals'], userProfile: UserProfile): 'green' | 'yellow' | 'red' {
    let status: 'green' | 'yellow' | 'red' = 'green';
    const calorieDiff = Math.abs(totals.calories - userProfile.dailyCalorieGoal);
    if (calorieDiff > 400) {
      status = 'red';
    } else if (calorieDiff > 200) {
      status = 'yellow';
    }
    return status;
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
  const t = useI18n();
  const locale = useCurrentLocale();

  // Initialize notification hook
  useNotifications();

  // Authentication and onboarding checks. This is the new, more robust logic.
  useEffect(() => {
    if (authLoading || !profileLoaded) {
      return;
    }

    if (!user) {
      router.push(`/${locale}/login`);
    } else if (user && !user.emailVerified) {
      return;
    } else if (!userProfile) {
      router.push(`/${locale}/onboarding`);
    } else {
      const walkthroughKey = `walkthroughCompleted-${user.uid}`;
      const completed = localStorage.getItem(walkthroughKey);
      if (!completed) {
        setShowWalkthrough(true);
      }
    }
  }, [user, userProfile, authLoading, profileLoaded, router, locale]);


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
      if (user && user.emailVerified && userProfile) {
        setIsLoadingData(true);
        const data = await loadDailyDataForUser(user.uid);
        setDailyData(data);
        setIsLoadingData(false);
      } else if (!user && !authLoading) {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [user, userProfile, authLoading]);

  
  // Save data to Firestore whenever it changes
  useEffect(() => {
    if (user && user.emailVerified && !isLoadingData) {
      saveDailyDataForUser(user.uid, dailyData);
    }
  }, [dailyData, user, isLoadingData]);
  

  const handleAnalysisUpdate = (result: NutritionalChatAnalysisOutput) => {
    if (!userProfile) return;
    
    if(!result || !result.totals || result.totals.calories === 0) {
        toast({
            variant: "destructive",
            title: t('dashboard.toast-analysis-failed'),
            description: t('dashboard.toast-analysis-failed-desc'),
        });
        const errorMessage: ChatMessage = { 
            id: String(Date.now() + 1), 
            role: 'system', 
            content: t('dashboard.chat-error'), 
            timestamp: new Date() 
        };
        setChatMessages(prev => [...prev, errorMessage]);
        return;
    }

    const today = startOfToday();
    const newDayData: DayData = {
      date: today,
      meals: result.meals,
      totals: result.totals,
      observations: result.observations,
      status: getDayStatus(result.totals, userProfile),
      creatineTaken: result.creatineTaken,
      proteinTaken: result.proteinTaken,
    };
    
    setDailyData(prevData => {
        const otherDays = prevData.filter(d => !isSameDay(d.date, today));
        return [...otherDays, newDayData];
    });
    
    const analysisSummary = `💡 **${t('profile.goals-title')}**\n${result.observations}\n\n**${t('profile.summary-title')}**\n- ${t('profile.goals-calories')}: ${result.totals.calories}\n- ${t('profile.goals-protein')}: ${result.totals.protein}g\n- ${t('profile.goals-fat')}: ${result.totals.fat}g\n- ${t('profile.goals-carbs')}: ${result.totals.carbs}g`;

    const assistantMessage: ChatMessage = { 
        id: String(Date.now() + 1), 
        role: 'assistant', 
        content: analysisSummary, 
        timestamp: new Date() 
    };
    setChatMessages(prev => [...prev, assistantMessage]);
  };
  
  if (authLoading || !profileLoaded || isLoadingData) {
    return <DashboardLoader />;
  }

  if (user && !user.emailVerified) {
    return <EmailVerificationGate />;
  }

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
