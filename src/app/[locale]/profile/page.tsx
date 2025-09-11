
'use client';

import { ArrowLeft, Target, TrendingUp, Award, Zap, Pill, Flame } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DietLogAILogo } from '@/components/diet-log-ai-logo';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/hooks/use-user-store';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLoader } from '@/components/dashboard-loader';
import { useAuth } from '@/hooks/use-auth';
import { loadDailyDataForUser } from '@/firebase/firestore';
import type { DayData, UserProfile } from '@/lib/types';
import { isSameDay, subDays, startOfToday } from 'date-fns';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { LanguageSwitcher } from '@/components/language-switcher';


function ProfileHeader() {
  const t = useI18n();
  const locale = useCurrentLocale();

  return (
    <header className={cn(
      "sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-sm"
    )}>
      <div className={cn(
        "flex h-full items-center justify-between gap-4 px-4 sm:px-6"
      )}>
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <DietLogAILogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            DietLogAI
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button asChild variant="outline">
            <Link href={`/${locale}/dashboard`}>
              <ArrowLeft className="mr-2" />
              {t('profile.back-btn')}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string | number, unit?: string }) {
    return (
        <Card className="text-center animate-fade-in-up">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2 mx-auto">
                    {icon}
                </div>
                <CardTitle className="text-2xl font-bold">{value}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, setUserProfile, isLoaded: profileLoaded } = useUserStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const t = useI18n();
  const locale = useCurrentLocale();

  useEffect(() => {
    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
    }
  },[user, authLoading, router, locale])
  
  // Effect for the one-time welcome notification, after permissions are granted in onboarding
  useEffect(() => {
    const notificationShownKey = `profileWelcomeNotificationShown-${user?.uid}`;
    const hasBeenShown = localStorage.getItem(notificationShownKey);

    if (userProfile && !hasBeenShown && "Notification" in window && Notification.permission === "granted") {
        new Notification(t('notifications.welcome-title'), {
            body: t('notifications.welcome-body', { name: userProfile.name.split(' ')[0] }),
            icon: '/icon-192x192.png'
        });
        localStorage.setItem(notificationShownKey, 'true');
    }
  }, [user, userProfile, t]);

  // Load daily data from Firestore when the component mounts or user changes
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

  const performanceStats = useMemo(() => {
    if (!dailyData || dailyData.length === 0) {
        return { currentStreak: 0, avgCalories: 0, daysTracked: 0, goalProgress: 0, avgProtein: 0, avgFat: 0, avgCarbs: 0 };
    }

    // --- Calculate Days Tracked & Averages ---
    const daysTracked = dailyData.length;
    const totalCalories = dailyData.reduce((sum, day) => sum + day.totals.calories, 0);
    const avgCalories = daysTracked > 0 ? Math.round(totalCalories / daysTracked) : 0;
    const avgProtein = daysTracked > 0 ? Math.round(dailyData.reduce((sum, day) => sum + day.totals.protein, 0) / daysTracked) : 0;
    const avgFat = daysTracked > 0 ? Math.round(dailyData.reduce((sum, day) => sum + day.totals.fat, 0) / daysTracked) : 0;
    const avgCarbs = daysTracked > 0 ? Math.round(dailyData.reduce((sum, day) => sum + day.totals.carbs, 0) / daysTracked) : 0;

    // --- Calculate Goal Progress (as % of green days) ---
    const greenDays = dailyData.filter(d => d.status === 'green').length;
    const goalProgress = daysTracked > 0 ? Math.round((greenDays / daysTracked) * 100) : 0;

    // --- Calculate Current Streak ---
    const sortedData = [...dailyData].sort((a,b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    let today = startOfToday();
    const startIndex = sortedData.findIndex(d => d.date && d.date <= today);
    if (startIndex !== -1) {
        let currentDate = sortedData[startIndex].date;
        if (isSameDay(currentDate, today) || isSameDay(currentDate, subDays(today, 1))) {
            for (let i = startIndex; i < sortedData.length; i++) {
                const day = sortedData[i];
                if (day.date && isSameDay(day.date, currentDate)) {
                    if (day.status === 'green') {
                        streak++;
                        currentDate = subDays(currentDate, 1);
                    } else { break; }
                } else { break; }
            }
        }
    }
    
    return { currentStreak: streak, avgCalories, daysTracked, goalProgress, avgProtein, avgFat, avgCarbs };
  }, [dailyData]);


  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: t('profile.toast-avatar-invalid'),
          description: t('profile.toast-avatar-invalid-desc'),
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if(userProfile) {
            setUserProfile({ ...userProfile, photoUrl: base64String });
            toast({
                title: t('profile.toast-avatar-updated'),
                description: t('profile.toast-avatar-updated-desc'),
            });
        }
      };
      reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: t('profile.toast-avatar-failed'),
            description: t('profile.toast-avatar-failed-desc'),
        });
      };
      reader.readAsDataURL(file);
    }
  };


  if (authLoading || !profileLoaded || !userProfile || isLoadingData) {
    return <DashboardLoader />;
  }
  
  const supplementText = () => {
      if (!userProfile?.supplementation) return t('profile.supplements-none');
      switch (userProfile.supplementation) {
          case 'none': return t('profile.supplements-none');
          case 'creatine': return t('profile.supplements-creatine');
          case 'protein': return t('profile.supplements-protein');
          case 'both': return t('profile.supplements-both');
          default: return 'Not specified';
      }
  }

  const goalText = () => {
    if (!userProfile?.goal) return '';
    switch(userProfile.goal) {
      case 'lose': return t('onboarding.goal-lose');
      case 'gain': return t('onboarding.goal-gain');
      case 'maintain': return t('onboarding.goal-maintain');
    }
  }

  const genderText = () => {
      if (!userProfile?.gender) return '';
      switch(userProfile.gender) {
          case 'male': return t('onboarding.gender-male');
          case 'female': return t('onboarding.gender-female');
          case 'other': return t('onboarding.gender-other');
      }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ProfileHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          
          {/* User Info Header */}
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in-up">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Avatar className="h-24 w-24 border-4 border-primary cursor-pointer hover:opacity-80 transition-opacity" onClick={handleAvatarClick}>
              <AvatarImage src={userProfile.photoUrl || ''} data-ai-hint="person face" />
              <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold font-headline">{userProfile.name}</h1>
                <p className="text-muted-foreground capitalize">{t('profile.goal-prefix', { goal: goalText() })}</p>
            </div>
          </div>

          {/* Performance Summary */}
           <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                    <CardTitle>{t('profile.summary-title')}</CardTitle>
                    <CardDescription>{t('profile.summary-desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <StatCard icon={<Flame className="w-6 h-6"/>} label={t('profile.streak-card')} value={`${performanceStats.currentStreak} ${t('profile.streak-days')}`} />
                       <StatCard icon={<Zap className="w-6 h-6"/>} label={t('profile.avg-calories-card')} value={performanceStats.avgCalories.toLocaleString()} unit={t('profile.avg-calories-unit')} />
                       <StatCard icon={<TrendingUp className="w-6 h-6"/>} label={t('profile.days-tracked-card')} value={performanceStats.daysTracked} />
                       <StatCard icon={<Award className="w-6 h-6"/>} label={t('profile.on-target-card')} value={`${performanceStats.goalProgress}%`} />
                    </div>
                </CardContent>
            </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Personal Details */}
            <Card className="md:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>{t('profile.info-title')}</CardTitle>
                <CardDescription>{t('profile.info-desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>{t('profile.info-age')}</span> <span className="font-medium">{userProfile.age}</span></div>
                <Separator />
                <div className="flex justify-between"><span>{t('profile.info-gender')}</span> <span className="font-medium">{genderText()}</span></div>
                <Separator />
                <div className="flex justify-between"><span>{t('profile.info-height')}</span> <span className="font-medium">{userProfile.height} {t('profile.info-height-unit')}</span></div>
                <Separator />
                <div className="flex justify-between"><span>{t('profile.info-weight')}</span> <span className="font-medium">{userProfile.weight} {t('profile.info-weight-unit')}</span></div>
                 <Separator />
                <div className="flex justify-between"><span>{t('profile.info-goal-weight')}</span> <span className="font-medium">{userProfile.goalWeight} {t('profile.info-weight-unit')}</span></div>
                 <Separator />
                <div className="flex justify-between"><span>{t('profile.info-bmi')}</span> <span className="font-medium">{userProfile.bmi}</span></div>
              </CardContent>
            </Card>

            {/* Supplementation */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                    <CardTitle>{t('profile.supplements-title')}</CardTitle>
                    <CardDescription>{t('profile.supplements-desc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                    <Pill className="w-12 h-12 text-primary" />
                    <p className="text-lg font-medium">{supplementText()}</p>
                </CardContent>
            </Card>

            {/* Nutrition Goals */}
            <Card className="md:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>{t('profile.goals-title')}</CardTitle>
                 <CardDescription>{t('profile.goals-desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-lg font-medium">
                      <span>{t('profile.goals-calories')}</span>
                      <span>{performanceStats.avgCalories.toLocaleString()} / {userProfile.dailyCalorieGoal.toLocaleString()} kcal</span>
                    </div>
                    <Progress value={(performanceStats.avgCalories / userProfile.dailyCalorieGoal) * 100} />
                 </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>{t('profile.goals-protein')}</span><span>{performanceStats.avgProtein}g / {userProfile.dailyProteinGoal}g</span></div>
                        <Progress value={(performanceStats.avgProtein / userProfile.dailyProteinGoal) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>{t('profile.goals-fat')}</span><span>{performanceStats.avgFat}g / {userProfile.dailyFatGoal}g</span></div>
                        <Progress value={(performanceStats.avgFat / userProfile.dailyFatGoal) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>{t('profile.goals-carbs')}</span><span>{performanceStats.avgCarbs}g / {userProfile.dailyCarbsGoal}g</span></div>
                        <Progress value={(performanceStats.avgCarbs / userProfile.dailyCarbsGoal) * 100} className="h-2" />
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
