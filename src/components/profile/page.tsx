
'use client';

import { ArrowLeft, Target, TrendingUp, Award, Zap, Pill } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NutriTrackLogo } from '@/components/nutri-track-logo';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/hooks/use-user-store';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLoader } from '@/components/dashboard-loader';
import { useAuth } from '@/hooks/use-auth';

// Mock data - in a real app, this would be fetched from a server
const performanceStats = {
    currentStreak: 12,
    avgCalories: 2145,
    daysTracked: 20,
    goalProgress: 60, // percentage
};

function ProfileHeader() {
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
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </Button>
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

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
  },[user, authLoading, router])

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select an image file.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if(userProfile) {
            const updatedProfile = { ...userProfile, photoUrl: base64String };
            setUserProfile(updatedProfile);
            toast({
                title: 'Profile Picture Updated',
                description: 'Your new photo has been saved successfully.',
            });
        }
      };
      reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'There was an error reading the file.',
        });
      };
      reader.readAsDataURL(file);
    }
  };


  if (authLoading || !profileLoaded || !userProfile) {
    return <DashboardLoader />;
  }
  
  const supplementText = () => {
      if (!userProfile?.supplementation) return 'None';
      switch (userProfile.supplementation) {
          case 'none': return 'None';
          case 'creatine': return 'Creatine';
          case 'protein': return 'Protein Powder';
          case 'both': return 'Creatine & Protein Powder';
          default: return 'Not specified';
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
                <p className="text-muted-foreground capitalize">Goal: {userProfile.goal} Weight</p>
            </div>
          </div>

          {/* Performance Summary */}
           <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                    <CardDescription>A quick look at your progress and habits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <StatCard icon={<Award className="w-6 h-6"/>} label="Current Streak" value={`${performanceStats.currentStreak} days`} />
                       <StatCard icon={<Zap className="w-6 h-6"/>} label="Avg. Calories" value={performanceStats.avgCalories.toLocaleString()} unit="kcal/day" />
                       <StatCard icon={<TrendingUp className="w-6 h-6"/>} label="Days Tracked" value={performanceStats.daysTracked} />
                       <StatCard icon={<Target className="w-6 h-6"/>} label="Goal Progress" value={`${performanceStats.goalProgress}%`} />
                    </div>
                </CardContent>
            </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Personal Details */}
            <Card className="md:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>The personal details used for calculations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Age</span> <span className="font-medium">{userProfile.age}</span></div>
                <Separator />
                <div className="flex justify-between"><span>Gender</span> <span className="font-medium capitalize">{userProfile.gender}</span></div>
                <Separator />
                <div className="flex justify-between"><span>Height</span> <span className="font-medium">{userProfile.height} cm</span></div>
                <Separator />
                <div className="flex justify-between"><span>Current Weight</span> <span className="font-medium">{userProfile.weight} kg</span></div>
                 <Separator />
                <div className="flex justify-between"><span>Goal Weight</span> <span className="font-medium">{userProfile.goalWeight} kg</span></div>
                 <Separator />
                <div className="flex justify-between"><span>BMI</span> <span className="font-medium">{userProfile.bmi}</span></div>
              </CardContent>
            </Card>

            {/* Supplementation */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                    <CardTitle>Supplementation</CardTitle>
                    <CardDescription>Your current supplement regimen.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                    <Pill className="w-12 h-12 text-primary" />
                    <p className="text-lg font-medium">{supplementText()}</p>
                </CardContent>
            </Card>

            {/* Nutrition Goals */}
            <Card className="md:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Daily Nutrition Goals</CardTitle>
                 <CardDescription>Your recommended daily intake targets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-lg font-medium"><span>Calories</span><span>{userProfile.dailyCalorieGoal.toLocaleString()} kcal</span></div>
                    <Progress value={(performanceStats.avgCalories / userProfile.dailyCalorieGoal) * 100} />
                 </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Protein</span><span>{userProfile.dailyProteinGoal}g</span></div>
                        <Progress value={(130 / userProfile.dailyProteinGoal) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Fat</span><span>{userProfile.dailyFatGoal}g</span></div>
                        <Progress value={(90 / userProfile.dailyFatGoal) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Carbs</span><span>{userProfile.dailyCarbsGoal}g</span></div>
                        <Progress value={(160 / userProfile.dailyCarbsGoal) * 100} className="h-2" />
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
