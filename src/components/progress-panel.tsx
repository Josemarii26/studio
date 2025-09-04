'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DayData, UserProfile } from '@/lib/types';
import { Flame, TrendingUp, Target } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { useMemo } from 'react';

interface ProgressPanelProps {
    dailyData: DayData[];
    userProfile: UserProfile;
}

const chartConfig = {
    calories: { label: "Calories", color: "hsl(var(--chart-1))" },
    goal: { label: "Goal", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function ProgressPanel({ dailyData, userProfile }: ProgressPanelProps) {
    const weeklyData = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), i);
            const data = dailyData.find(d => isSameDay(d.date, date));
            return {
                date: format(date, 'eee'),
                calories: data?.totals.calories || 0,
                goal: userProfile.dailyCalorieGoal
            };
        }).reverse();
    }, [dailyData, userProfile.dailyCalorieGoal]);

    const greenDaysStreak = useMemo(() => {
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
    }, [dailyData]);


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Calorie Intake</CardTitle>
                    <CardDescription>Your calories vs. your daily goal for the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={weeklyData} margin={{ top: 20 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel />} />
                                <Bar dataKey="calories" fill="var(--color-calories)" radius={8} />
                                <Line type="monotone" dataKey="goal" stroke="var(--color-goal)" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                 <Card className="flex flex-col items-center justify-center p-6 text-center">
                    <CardTitle className="mb-2 text-lg">Streak</CardTitle>
                    <div className="flex items-center gap-2">
                        <Flame className="h-10 w-10 text-destructive" />
                        <span className="text-5xl font-bold">{greenDaysStreak}</span>
                    </div>
                    <CardDescription className="mt-2">on-target days</CardDescription>
                </Card>
                 <Card className="flex flex-col items-center justify-center p-6 text-center">
                    <CardTitle className="mb-2 text-lg">Daily Goal</CardTitle>
                    <div className="flex items-center gap-2">
                        <Target className="h-10 w-10 text-primary" />
                        <span className="text-4xl font-bold">{userProfile.dailyCalorieGoal.toLocaleString()}</span>
                    </div>
                    <CardDescription className="mt-2">kcal</CardDescription>
                </Card>
            </div>

            <Card>
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
