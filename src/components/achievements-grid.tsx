
'use client';
import { useMemo } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Flame, Star, Target, Zap, TrendingUp, CalendarDays, ThumbsUp, Crown, Sparkles, Trophy } from 'lucide-react';
import { isSameDay, subDays, startOfToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface AchievementsGridProps {
    dailyData: DayData[];
    userProfile: UserProfile;
}

type AchievementTier = 'bronze' | 'silver' | 'gold' | 'special';

interface Achievement {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    isUnlocked: boolean;
    tier: AchievementTier;
}

const tierStyles: { [key in AchievementTier]: string } = {
    bronze: 'border-amber-700/40 bg-gradient-to-br from-amber-900/10 to-card shadow-md',
    silver: 'border-slate-400/50 bg-gradient-to-br from-slate-500/10 to-card shadow-lg',
    gold: 'border-yellow-500/50 bg-gradient-to-br from-yellow-600/10 to-card shadow-xl',
    special: 'border-primary/50 bg-gradient-to-br from-primary/10 to-card shadow-2xl animated-special-border',
};

const iconStyles: { [key in AchievementTier]: string } = {
    bronze: 'bg-amber-700/10 text-amber-600',
    silver: 'bg-slate-400/10 text-slate-400',
    gold: 'bg-yellow-500/10 text-yellow-500',
    special: 'bg-primary/10 text-primary',
};


const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = achievement.isUnlocked;
    return (
        <Card className={cn(
            'masonry-item transition-all duration-500',
            isUnlocked ? tierStyles[achievement.tier] : 'bg-muted/60 opacity-60'
        )}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg shrink-0',
                    isUnlocked ? iconStyles[achievement.tier] : 'bg-muted-foreground/10 text-muted-foreground'
                )}>
                    {achievement.icon}
                </div>
                <div>
                    <CardTitle className="text-base">{achievement.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className={cn(
                    'text-sm',
                    isUnlocked ? 'text-card-foreground' : 'text-muted-foreground'
                )}>
                    {achievement.description}
                </p>
            </CardContent>
        </Card>
    );
};

export function AchievementsGrid({ dailyData, userProfile }: AchievementsGridProps) {

    const streakData = useMemo(() => {
        if (!dailyData || dailyData.length === 0) return { greenDaysStreak: 0, perfectWeeks: 0 };

        const sortedData = [...dailyData].sort((a, b) => b.date.getTime() - a.date.getTime());
        let greenDaysStreak = 0;
        let perfectWeeks = 0;
        
        // --- Streak Calculation ---
        let today = startOfToday();
        const startIndex = sortedData.findIndex(d => d.date && d.date <= today);
        if (startIndex !== -1) {
            let currentDate = sortedData[startIndex].date;
            // A streak can only be current if the last log was for today or yesterday.
            if (isSameDay(currentDate, today) || isSameDay(currentDate, subDays(today,1))) {
                for (let i = startIndex; i < sortedData.length; i++) {
                    const day = sortedData[i];
                    if (day.date && isSameDay(day.date, currentDate)) {
                        if (day.status === 'green') {
                            greenDaysStreak++;
                            currentDate = subDays(currentDate, 1);
                        } else { break; }
                    } else { break; }
                }
            }
        }
        
        // --- Perfect Week Calculation ---
        const weeks = new Set<string>();
        sortedData.forEach(d => {
            const weekKey = `${startOfWeek(d.date).getTime()}`;
            weeks.add(weekKey);
        });

        weeks.forEach(weekKey => {
            const weekStart = new Date(parseInt(weekKey));
            const weekEnd = endOfWeek(weekStart);
            const daysInWeek = sortedData.filter(d => isWithinInterval(d.date, { start: weekStart, end: weekEnd }));
            if (daysInWeek.length === 7 && daysInWeek.every(d => d.status === 'green')) {
                perfectWeeks++;
            }
        });

        return { greenDaysStreak, perfectWeeks };
    }, [dailyData]);
    
    const { greenDaysStreak, perfectWeeks } = streakData;
    const totalDaysTracked = dailyData.length;

    const goalReached = useMemo(() => {
        if (!userProfile) return false;
        const { weight, goalWeight, goal } = userProfile;
        if (goal === 'lose') return weight <= goalWeight;
        if (goal === 'gain') return weight >= goalWeight;
        return false;
    }, [userProfile]);


    const achievements: Achievement[] = [
        // --- Bronze ---
        { id: 'first-log', tier: 'bronze', icon: <Star className="h-6 w-6" />, title: 'The First Step', description: 'Log your first day of meals. The journey begins!', isUnlocked: totalDaysTracked >= 1 },
        { id: 'first-green', tier: 'bronze', icon: <ThumbsUp className="h-6 w-6" />, title: 'Nailed It', description: 'Have your first "on-target" day. The first of many!', isUnlocked: dailyData.some(d => d.status === 'green') },
        { id: 'ai-power', tier: 'bronze', icon: <Zap className="h-6 w-6" />, title: 'AI Power', description: 'Use the AI chat to log your meals for the first time.', isUnlocked: totalDaysTracked >= 1 },
        { id: 'profile-pic', tier: 'bronze', icon: <Sparkles className="h-6 w-6" />, title: 'Looking Good!', description: 'Set your first profile picture.', isUnlocked: !!userProfile.photoUrl },

        // --- Silver ---
        { id: 'streak-3', tier: 'silver', icon: <Flame className="h-6 w-6" />, title: 'On a Roll', description: 'Achieve a 3-day streak of on-target calorie intake.', isUnlocked: greenDaysStreak >= 3 },
        { id: 'streak-7', tier: 'silver', icon: <Award className="h-6 w-6" />, title: 'Week of Dedication', description: 'Complete a 7-day streak. Your consistency is paying off!', isUnlocked: greenDaysStreak >= 7 },
        { id: 'tracked-10', tier: 'silver', icon: <CalendarDays className="h-6 w-6" />, title: 'Consistency is Key', description: 'Successfully log 10 days in total.', isUnlocked: totalDaysTracked >= 10 },
        { id: 'perfect-week', tier: 'silver', icon: <Trophy className="h-6 w-6" />, title: 'Perfect Week', description: 'Achieve a perfect 7/7 "on-target" days in a single week.', isUnlocked: perfectWeeks >= 1 },

        // --- Gold ---
        { id: 'streak-14', tier: 'gold', icon: <Flame className="h-6 w-6" />, title: 'Unstoppable', description: 'Maintain an incredible 14-day on-target streak.', isUnlocked: greenDaysStreak >= 14 },
        { id: 'tracked-30', tier: 'gold', icon: <CalendarDays className="h-6 w-6" />, title: '30-Day Club', description: 'Log an entire month of meals. That\'s commitment!', isUnlocked: totalDaysTracked >= 30 },
        { id: 'streak-30', tier: 'gold', icon: <Crown className="h-6 w-6" />, title: 'Habit Formed', description: 'Achieve a legendary 30-day on-target streak.', isUnlocked: greenDaysStreak >= 30 },
        
        // --- Special ---
        { id: 'goal-reached', tier: 'special', icon: <Target className="h-6 w-6" />, title: 'Goal Reached!', description: 'You did it! You have successfully reached your goal weight.', isUnlocked: goalReached },
    ];

    const tierOrder: { [key in AchievementTier]: number } = { special: 0, gold: 1, silver: 2, bronze: 3 };
    const sortedAchievements = [...achievements].sort((a, b) => {
        if (a.isUnlocked !== b.isUnlocked) {
            return Number(b.isUnlocked) - Number(a.isUnlocked);
        }
        return tierOrder[a.tier] - tierOrder[b.tier];
    });

    return (
        <div className="masonry-grid animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {sortedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>
    );
}
