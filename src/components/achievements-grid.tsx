
'use client';
import { useMemo } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Flame, Star, Target, Zap, TrendingUp, CalendarDays } from 'lucide-react';
import { isSameDay, subDays, startOfToday } from 'date-fns';

interface AchievementsGridProps {
    dailyData: DayData[];
    userProfile: UserProfile;
}

interface Achievement {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    isUnlocked: boolean;
}

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = achievement.isUnlocked;
    return (
        <Card className={`masonry-item transition-all duration-500 ${isUnlocked ? 'border-primary/50 bg-card shadow-lg' : 'bg-muted/60'}`}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                    {achievement.icon}
                </div>
                <div>
                    <CardTitle className="text-base">{achievement.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className={`text-sm ${isUnlocked ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                    {achievement.description}
                </p>
            </CardContent>
        </Card>
    );
};

export function AchievementsGrid({ dailyData, userProfile }: AchievementsGridProps) {

    const greenDaysStreak = useMemo(() => {
        if (!dailyData || dailyData.length === 0) return 0;
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
    }, [dailyData]);

    const totalDaysTracked = dailyData.length;
    const isGoalHalfway = useMemo(() => {
        if (!userProfile) return false;
        const { weight, goalWeight } = userProfile;
        const startingWeight = (userProfile as any).startingWeight || weight; // Assume starting weight if not set
        const totalToLose = startingWeight - goalWeight;
        const currentLoss = startingWeight - weight;
        return totalToLose > 0 && currentLoss >= totalToLose / 2;
    }, [userProfile]);

    const achievements: Achievement[] = [
        {
            id: 'first-log',
            icon: <Star className="h-6 w-6" />,
            title: 'The First Step',
            description: 'You\'ve logged your first day of meals. The journey begins!',
            isUnlocked: totalDaysTracked >= 1,
        },
        {
            id: 'streak-3',
            icon: <Flame className="h-6 w-6" />,
            title: 'On a Roll',
            description: 'Achieved a 3-day streak of on-target calorie intake.',
            isUnlocked: greenDaysStreak >= 3,
        },
        {
            id: 'streak-7',
            icon: <Award className="h-6 w-6" />,
            title: 'Week of Dedication',
            description: 'Completed a 7-day streak. Your consistency is paying off!',
            isUnlocked: greenDaysStreak >= 7,
        },
        {
            id: 'halfway-there',
            icon: <Target className="h-6 w-6" />,
            title: 'Halfway Point!',
            description: 'You are more than halfway to your weight goal. Amazing progress!',
            isUnlocked: isGoalHalfway,
        },
        {
            id: 'tracked-10',
            icon: <CalendarDays className="h-6 w-6" />,
            title: 'Consistency is Key',
            description: 'You have successfully logged 10 days in total.',
            isUnlocked: totalDaysTracked >= 10,
        },
        {
            id: 'ai-power',
            icon: <Zap className="h-6 w-6" />,
            title: 'Power User',
            description: 'Used the AI chat to log your meals for the first time.',
            isUnlocked: totalDaysTracked >= 1,
        },
        {
            id: 'first-green',
            icon: <TrendingUp className="h-6 w-6" />,
            title: 'Nailed It',
            description: 'Had your first "on-target" day. The first of many!',
            isUnlocked: dailyData.some(d => d.status === 'green'),
        },
    ];

    const sortedAchievements = [...achievements].sort((a, b) => Number(b.isUnlocked) - Number(a.isUnlocked));

    return (
        <div className="masonry-grid animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {sortedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>
    );
}
