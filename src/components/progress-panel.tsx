
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DayData } from '@/lib/types';
import { Flame, TrendingUp, Target, HeartPulse } from 'lucide-react';
import { isSameDay, subDays } from 'date-fns';
import { useMemo } from 'react';
import { useUserStore } from '@/hooks/use-user-store';

interface ProgressPanelProps {
    dailyData: DayData[];
}

export function ProgressPanel({ dailyData }: ProgressPanelProps) {
    const { userProfile, isLoaded } = useUserStore();
    
    const greenDaysStreak = useMemo(() => {
        if (!isLoaded) return 0;
        const sortedData = [...dailyData].sort((a,b) => b.date.getTime() - a.date.getTime());
        let streak = 0;
        let today = new Date();
        
        // Find first entry that is today or in the past
        const startIndex = sortedData.findIndex(d => isSameDay(d.date, today) || d.date < today);
        if (startIndex === -1) return 0;
        
        let currentDate = sortedData[startIndex].date;
        if (!isSameDay(currentDate, today) && !isSameDay(currentDate, subDays(today,1))) {
             return 0; // No data for today or yesterday, streak is 0
        }
        
        for (let i = startIndex; i < sortedData.length; i++) {
            const day = sortedData[i];
            if (isSameDay(day.date, currentDate) && day.status === 'green') {
                streak++;
                currentDate = subDays(currentDate, 1);
            } else {
                break;
            }
        }
        return streak;
    }, [dailyData, isLoaded]);

    if (!isLoaded || !userProfile) {
        return (
             <div className="grid gap-4 grid-cols-1">
                <Card className="h-[128px] animate-pulse bg-muted"></Card>
                <Card className="h-[128px] animate-pulse bg-muted"></Card>
                <Card className="h-[128px] animate-pulse bg-muted"></Card>
                <Card className="h-[218px] animate-pulse bg-muted"></Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 grid-cols-1">
            <Card className="flex flex-col items-center justify-center p-6 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardTitle className="mb-2 text-lg">Streak</CardTitle>
                <div className="flex items-center gap-2">
                    <Flame className="h-10 w-10 text-destructive" />
                    <span className="text-5xl font-bold">{greenDaysStreak}</span>
                </div>
                <CardDescription className="mt-2">on-target days</CardDescription>
            </Card>
            
            <Card className="flex flex-col items-center justify-center p-6 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardTitle className="mb-2 text-lg">Daily Goal</CardTitle>
                <div className="flex items-center gap-2">
                    <Target className="h-10 w-10 text-primary" />
                    <span className="text-4xl font-bold">{userProfile.dailyCalorieGoal.toLocaleString()}</span>
                </div>
                <CardDescription className="mt-2">kcal</CardDescription>
            </Card>

            <Card className="flex flex-col items-center justify-center p-6 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <CardTitle className="mb-2 text-lg">BMI</CardTitle>
                <div className="flex items-center gap-2">
                    <HeartPulse className="h-10 w-10 text-status-red" />
                    <span className="text-5xl font-bold">{userProfile.bmi}</span>
                </div>
                <CardDescription className="mt-2">Body Mass Index</CardDescription>
            </Card>
            
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Weight Trend
                    </CardTitle>
                    <CardDescription>Track your weight over time.</CardDescription>
                </CardHeader>
                <CardContent className="flex h-[150px] items-center justify-center text-muted-foreground">
                    <p>Feature coming soon!</p>
                </CardContent>
            </Card>
        </div>
    );
}
