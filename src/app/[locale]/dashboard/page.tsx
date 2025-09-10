
'use client';

import { useState, useEffect } from 'react';
import { NutritionalChat } from '@/components/nutritional-chat';
import { DietLogAILogo } from '@/components/diet-log-ai-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogOut, MailWarning, BellPlus } from 'lucide-react';
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
import { NutritionalChatAnalysisOutput, nutritionalChatAnalysis } from '@/ai/flows/nutritional-chat-analysis';
import { startOfToday, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { WalkthroughModal } from '@/components/walkthrough-modal';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { useNotifications } from '@/hooks/use-notifications';
import { LanguageSwitcher } from '@/components/language-switcher';

// Helper function to convert Base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, isLoaded: isProfileLoaded, setUserProfile } = useUserStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const t = useI18n();
  const locale = useCurrentLocale();
  const { toast } = useToast();
  const [isActivating, setIsActivating] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  const handleEnableNotifications = async () => {
      if (!user || 'serviceWorker' in navigator === false) {
          toast({ variant: "destructive", title: "Browser not supported", description: "Push notifications are not supported by your browser." });
          return;
      }
      setIsActivating(true);
      try {
          const res = await fetch('/api/vapid-key');
          const { publicKey } = await res.json();
          if (!publicKey) {
              throw new Error('VAPID public key not found.');
          }
          
          const applicationServerKey = urlBase64ToUint8Array(publicKey);

          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
              toast({ title: "Already Subscribed", description: "You are already subscribed to notifications." });
              return;
          }
          
          const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey,
          });

          await fetch('/api/save-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, subscription }),
          });
          
          if (userProfile) {
            setUserProfile({...userProfile, pushSubscription: subscription});
          }

          toast({
              title: t('notifications.permission-granted-title'),
              description: t('notifications.permission-granted-desc'),
          });

      } catch (err: any) {
          console.error('Error enabling notifications:', err);
          let description = err.message;
          if (err.name === 'NotAllowedError') {
              description = "Permission was denied. Please enable notifications in your browser settings.";
          }
          toast({ variant: "destructive", title: "Error", description });
      } finally {
          setIsActivating(false);
      }
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
        <div className="flex items-center gap-2">
           {isProfileLoaded && !userProfile?.pushSubscription && (
             <Button variant="outline" size="sm" onClick={handleEnableNotifications} disabled={isActivating || authLoading}>
                <BellPlus className="mr-2 h-4 w-4" />
                {t('notifications.enable-button')}
            </Button>
           )}
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
  const locale = useCurrentLocale();
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const t = useI18n();

  // Initialize notification hook. It will run in the background.
  useNotifications();

  // Authentication and onboarding checks. This is the new, more robust logic.
  useEffect(() => {
    if (authLoading || !profileLoaded) {
      return; // Wait until auth and profile are loaded
    }

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!user.emailVerified) {
      return; // Do nothing, the EmailVerificationGate will be shown
    }
    
    // At this point, user is logged in and email is verified.
    // Now we check if they have a profile.
    if (!userProfile) {
      router.push(`/${locale}/onboarding`);
      return;
    }

    // If we get here, user is verified and has a profile. Show the walkthrough if needed.
    const walkthroughKey = `walkthroughCompleted-${user.uid}`;
    const completed = localStorage.getItem(walkthroughKey);
    if (!completed) {
      setShowWalkthrough(true);
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
  
  if (authLoading || !profileLoaded) {
    return <DashboardLoader />;
  }

  // If user exists but email is not verified, show the verification gate.
  if (user && !user.emailVerified) {
    return <EmailVerificationGate />;
  }
  
  // If user is logged in, verified, but has no profile, it means they need to onboard.
  // The useEffect above will handle redirection, but we show a loader in the meantime.
  if (user && user.emailVerified && !userProfile) {
    return <DashboardLoader />;
  }

  // If we reach here, user is fully authenticated and has a profile.
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
