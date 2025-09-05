
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DayData } from '@/lib/types';
import { Flame, TrendingUp, Target, HeartPulse } from 'lucide-react';
import { isSameDay, subDays, startOfToday } from 'date-fns';
import { useMemo } from 'react';
import { useUserStore } from '@/hooks/use-user-store';

interface ProgressPanelProps {
    dailyData: DayData[];
}

export function ProgressPanel({ dailyData }: ProgressPanelProps) {
    const { userProfile, isLoaded } = useUserStore();
    
    const greenDaysStreak = useMemo(() => {
        if (!isLoaded || !dailyData || dailyData.length === 0) return 0;
        
        const sortedData = [...dailyData].sort((a,b) => b.date.getTime() - a.date.getTime());
        let streak = 0;
        let today = startOfToday();
        
        // Find the starting point for the streak check (either today or the most recent logged day)
        const startIndex = sortedData.findIndex(d => d.date && d.date <= today);
        if (startIndex === -1) return 0; // No data on or before today
        
        let currentDate = sortedData[startIndex].date;

        // A streak can only be current if the last log was for today or yesterday.
        if (!isSameDay(currentDate, today) && !isSameDay(currentDate, subDays(today,1))) {
             return 0; 
        }
        
        // Iterate backwards from the starting point
        for (let i = startIndex; i < sortedData.length; i++) {
            const day = sortedData[i];
            // Check if the day from our data matches the day we're expecting in the streak
            if (day.date && isSameDay(day.date, currentDate)) {
                if (day.status === 'green') {
                    streak++;
                    currentDate = subDays(currentDate, 1); // Move to the previous day for the next check
                } else {
                    break; // Streak broken
                }
            } else {
                // If the expected day is missing from the data, the streak is broken
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
                <Card className="h-[218px] animate-pulse bg-muted"></Card>
            </div>
        )
    }

    return (
        <div className="grid gap-6 grid-cols-1 animate-fade-in-up">
            <Card className="p-6 text-center shadow-lg">
                <CardTitle className="mb-2 text-lg">Streak</CardTitle>
                <div className="flex items-center justify-center gap-2">
                    <Flame className="h-10 w-10 text-destructive" />
                    <span className="text-5xl font-bold">{greenDaysStreak}</span>
                </div>
                <CardDescription className="mt-2">on-target days</CardDescription>
            </Card>
            
            <Card className="p-6 text-center shadow-lg">
                <CardTitle className="mb-2 text-lg">Daily Goal</CardTitle>
                <div className="flex items-center justify-center gap-2">
                    <Target className="h-10 w-10 text-primary" />
                    <span className="text-4xl font-bold">{userProfile.dailyCalorieGoal.toLocaleString()}</span>
                </div>
                <CardDescription className="mt-2">kcal</CardDescription>
            </Card>
            
            <Card className="shadow-lg">
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
