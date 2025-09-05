
'use client';
import { useMemo } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Award, Flame, Star, Target, Zap, TrendingUp, CalendarDays, ThumbsUp, Crown, Sparkles, Trophy, ChefHat, Dumbbell, Sun, Moon } from 'lucide-react';
import { isSameDay, subDays, startOfToday, startOfWeek, endOfWeek, isWithinInterval, getDay } from 'date-fns';
import { AchievementCategory } from './achievement-category';
import type { Achievement, AchievementTier } from '@/lib/types';


export function AchievementsGrid({ dailyData, userProfile }: { dailyData: DayData[], userProfile: UserProfile }) {

    const calculatedData = useMemo(() => {
        if (!dailyData || dailyData.length === 0) {
            return { greenDaysStreak: 0, perfectWeeks: 0, perfectMacrosDays: 0, loggedWeekends: 0 };
        }

        const sortedData = [...dailyData].sort((a, b) => b.date.getTime() - a.date.getTime());
        let greenDaysStreak = 0;
        let perfectWeeks = 0;
        let perfectMacrosDays = 0;
        let loggedWeekends = 0;

        // --- Streak Calculation ---
        let today = startOfToday();
        const startIndex = sortedData.findIndex(d => d.date && d.date <= today);
        if (startIndex !== -1) {
            let currentDate = sortedData[startIndex].date;
            if (isSameDay(currentDate, today) || isSameDay(currentDate, subDays(today, 1))) {
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
        
        // --- Week, Macro, and Weekend Calculation ---
        const weeks = new Set<string>();
        sortedData.forEach(d => {
            const weekKey = `${startOfWeek(d.date).getTime()}`;
            weeks.add(weekKey);
            
            // Perfect Macros
            const pDiff = Math.abs(d.totals.protein - userProfile.dailyProteinGoal);
            const cDiff = Math.abs(d.totals.carbs - userProfile.dailyCarbsGoal);
            const fDiff = Math.abs(d.totals.fat - userProfile.dailyFatGoal);
            if(d.status === 'green' && pDiff < 10 && cDiff < 20 && fDiff < 10) {
                perfectMacrosDays++;
            }

            // Weekend Warrior
            const dayOfWeek = getDay(d.date); // Sunday is 0, Saturday is 6
            if(dayOfWeek === 0 || dayOfWeek === 6) {
                loggedWeekends++;
            }
        });

        weeks.forEach(weekKey => {
            const weekStart = new Date(parseInt(weekKey));
            const weekEnd = endOfWeek(weekStart);
            const daysInWeek = sortedData.filter(d => isWithinInterval(d.date, { start: weekStart, end: weekEnd }));
            if (daysInWeek.length === 7 && daysInWeek.every(d => d.status === 'green')) {
                perfectWeeks++;
            }
        });

        return { greenDaysStreak, perfectWeeks, perfectMacrosDays, loggedWeekends };
    }, [dailyData, userProfile]);
    
    const { greenDaysStreak, perfectWeeks, perfectMacrosDays, loggedWeekends } = calculatedData;
    const totalDaysTracked = dailyData.length;

    const goalReached = useMemo(() => {
        if (!userProfile) return false;
        const { weight, goalWeight, goal } = userProfile;
        if (goal === 'lose') return weight <= goalWeight;
        if (goal === 'gain') return weight >= goalWeight;
        if (goal === 'maintain') return Math.abs(weight - goalWeight) <= 1; // Allow 1kg tolerance for maintenance
        return false;
    }, [userProfile]);

    const achievements: Achievement[] = [
        // --- Bronze Tier ---
        { id: 'first-log', tier: 'bronze', icon: <Star className="h-6 w-6" />, title: 'The First Step', description: 'Log your first day of meals.', isUnlocked: totalDaysTracked >= 1 },
        { id: 'ai-power', tier: 'bronze', icon: <Zap className="h-6 w-6" />, title: 'AI Power', description: 'Use the AI chat to log your meals.', isUnlocked: totalDaysTracked >= 1 },
        { id: 'first-green', tier: 'bronze', icon: <ThumbsUp className="h-6 w-6" />, title: 'Nailed It', description: 'Have your first "on-target" day.', isUnlocked: dailyData.some(d => d.status === 'green') },
        { id: 'profile-pic', tier: 'bronze', icon: <Sparkles className="h-6 w-6" />, title: 'Looking Good!', description: 'Set your first profile picture.', isUnlocked: !!userProfile.photoUrl },
        { id: 'weekend-warrior', tier: 'bronze', icon: <Sun className="h-6 w-6" />, title: 'Weekend Warrior', description: 'Log your meals on a weekend day.', isUnlocked: loggedWeekends > 0 },
        { id: 'perfect-macros-1', tier: 'bronze', icon: <ChefHat className="h-6 w-6" />, title: 'Budding Chef', description: 'Hit all your macro targets perfectly for the first time.', isUnlocked: perfectMacrosDays >= 1 },
       
        // --- Silver Tier ---
        { id: 'streak-3', tier: 'silver', icon: <Flame className="h-6 w-6" />, title: 'On a Roll', description: 'Achieve a 3-day on-target streak.', isUnlocked: greenDaysStreak >= 3 },
        { id: 'tracked-10', tier: 'silver', icon: <CalendarDays className="h-6 w-6" />, title: 'Consistency is Key', description: 'Successfully log 10 total days.', isUnlocked: totalDaysTracked >= 10 },
        { id: 'perfect-week-1', tier: 'silver', icon: <Trophy className="h-6 w-6" />, title: 'Perfect Week', description: 'Achieve a perfect 7/7 "on-target" days in a single week.', isUnlocked: perfectWeeks >= 1 },
        { id: 'streak-7', tier: 'silver', icon: <Award className="h-6 w-6" />, title: 'Week of Dedication', description: 'Complete a 7-day on-target streak.', isUnlocked: greenDaysStreak >= 7 },
        { id: 'perfect-macros-5', tier: 'silver', icon: <ChefHat className="h-6 w-6" />, title: 'Macro Specialist', description: 'Hit all your macro targets perfectly on 5 different days.', isUnlocked: perfectMacrosDays >= 5 },
        { id: 'tracked-20', tier: 'silver', icon: <CalendarDays className="h-6 w-6" />, title: 'Dedicated Tracker', description: 'Successfully log 20 total days.', isUnlocked: totalDaysTracked >= 20 },

        // --- Gold Tier ---
        { id: 'streak-14', tier: 'gold', icon: <Flame className="h-6 w-6" />, title: 'Unstoppable', description: 'Maintain an incredible 14-day on-target streak.', isUnlocked: greenDaysStreak >= 14 },
        { id: 'tracked-30', tier: 'gold', icon: <CalendarDays className="h-6 w-6" />, title: '30-Day Club', description: 'Log an entire month of meals.', isUnlocked: totalDaysTracked >= 30 },
        { id: 'perfect-week-2', tier: 'gold', icon: <Trophy className="h-6 w-6" />, title: 'Double Down', description: 'Achieve two separate "Perfect Weeks".', isUnlocked: perfectWeeks >= 2 },
        { id: 'perfect-macros-15', tier: 'gold', icon: <ChefHat className="h-6 w-6" />, title: 'Macro Virtuoso', description: 'Hit all your macro targets perfectly on 15 different days.', isUnlocked: perfectMacrosDays >= 15 },
        { id: 'tracked-50', tier: 'gold', icon: <TrendingUp className="h-6 w-6" />, title: 'Seasoned Pro', description: 'Log a total of 50 days of meals.', isUnlocked: totalDaysTracked >= 50 },
        { id: 'streak-30', tier: 'gold', icon: <Crown className="h-6 w-6" />, title: 'Habit Formed', description: 'Achieve a legendary 30-day on-target streak.', isUnlocked: greenDaysStreak >= 30 },
        
        // --- Special Tier ---
        { id: 'goal-reached', tier: 'special', icon: <Target className="h-6 w-6" />, title: 'Goal Reached!', description: 'You did it! You have successfully reached your weight goal.', isUnlocked: goalReached },
        { id: 'tracked-100', tier: 'special', icon: <Dumbbell className="h-6 w-6" />, title: 'Century Club', description: 'Log 100 days. Your commitment is extraordinary!', isUnlocked: totalDaysTracked >= 100 },
        { id: 'night-owl', tier: 'special', icon: <Moon className="h-6 w-6" />, title: 'Night Owl', description: 'Log your meals after 10 PM.', isUnlocked: dailyData.some(d => d.date.getHours() >= 22)},
    ];

    const groupedAchievements = useMemo(() => {
        const groups: { [key in AchievementTier]: Achievement[] } = {
            bronze: [],
            silver: [],
            gold: [],
            special: [],
        };

        achievements.forEach(ach => {
            groups[ach.tier].push(ach);
        });

        // Sort within each group
        for (const tier in groups) {
            groups[tier as AchievementTier].sort((a, b) => Number(b.isUnlocked) - Number(a.isUnlocked));
        }

        return groups;
    }, [achievements]);


    return (
        <div className="grid grid-cols-1 @[800px]:grid-cols-2 gap-6 animate-fade-in-up">
            <AchievementCategory 
                title="Bronze Achievements"
                achievements={groupedAchievements.bronze}
                tier="bronze"
            />
            <AchievementCategory 
                title="Silver Achievements"
                achievements={groupedAchievements.silver}
                tier="silver"
            />
            <AchievementCategory 
                title="Gold Achievements"
                achievements={groupedAchievements.gold}
                tier="gold"
            />
            <AchievementCategory 
                title="Special Achievements"
                achievements={groupedAchievements.special}
                tier="special"
            />
        </div>
    );
}
