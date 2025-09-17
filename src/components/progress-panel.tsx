
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DayData } from '@/lib/types';
import { Flame, TrendingUp, Target, HeartPulse } from 'lucide-react';
import { isSameDay, subDays, startOfToday } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { useUserStore } from '@/hooks/use-user-store';
import { useI18n } from '@/locales/client';

interface ProgressPanelProps {
    dailyData: DayData[];
}

const useAnimatedCounter = (endValue: number, duration = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const progress = currentTime - startTime;
            const currentCount = Math.min(Math.floor((progress / duration) * endValue), endValue);
            setCount(currentCount);

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [endValue, duration]);

    return count;
};

export function ProgressPanel({ dailyData }: ProgressPanelProps) {
    const { userProfile, isLoaded } = useUserStore();
    const t = useI18n();
    
    const greenDaysStreak = useMemo(() => {
        if (!isLoaded || !dailyData || dailyData.length === 0) return 0;
        
        const sortedData = [...dailyData].sort((a,b) => b.date.getTime() - a.date.getTime());
        let streak = 0;
        let today = startOfToday();
        
        const startIndex = sortedData.findIndex(d => d.date && d.date <= today);
        if (startIndex === -1) return 0;
        
        let currentDate = sortedData[startIndex].date;

        if (!isSameDay(currentDate, today) && !isSameDay(currentDate, subDays(today,1))) {
             return 0; 
        }
        
        for (let i = startIndex; i < sortedData.length; i++) {
            const day = sortedData[i];
            if (day.date && isSameDay(day.date, currentDate)) {
                if (day.status === 'green') {
                    streak++;
                    currentDate = subDays(currentDate, 1);
                } else {
                    break;
                }
            } else {
                break; 
            }
        }
        return streak;
    }, [dailyData, isLoaded]);

    const animatedStreak = useAnimatedCounter(greenDaysStreak);
    const animatedGoal = useAnimatedCounter(userProfile?.dailyCalorieGoal || 0);

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
        <div className="grid gap-6 grid-cols-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card className="p-6 text-center shadow-lg">
                <CardTitle className="mb-2 text-lg">{t('dashboard.progress-streak-title')}</CardTitle>
                <div className="flex items-center justify-center gap-2">
                    <Flame className="h-10 w-10 text-destructive" />
                    <span className="text-5xl font-bold">{animatedStreak}</span>
                </div>
                <CardDescription className="mt-2">{t('dashboard.progress-streak-desc')}</CardDescription>
            </Card>
            
            <Card className="p-6 text-center shadow-lg">
                <CardTitle className="mb-2 text-lg">{t('dashboard.progress-goal-title')}</CardTitle>
                <div className="flex items-center justify-center gap-2">
                    <Target className="h-10 w-10 text-primary" />
                    <span className="text-4xl font-bold">{animatedGoal.toLocaleString()}</span>
                </div>
                <CardDescription className="mt-2">kcal</CardDescription>
            </Card>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {t('dashboard.progress-trend-title')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.progress-trend-desc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex h-[150px] items-center justify-center text-muted-foreground">
                    <p>{t('dashboard.progress-trend-soon')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
