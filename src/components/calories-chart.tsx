
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';
import type { DayData } from '@/lib/types';
import { format, subDays, isSameDay } from 'date-fns';
import { useI18n } from '@/locales/client';

interface CaloriesChartProps {
  dailyData: DayData[];
}

export function CaloriesChart({ dailyData }: CaloriesChartProps) {
  const t = useI18n();

  const last7DaysData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayData = dailyData.find(d => d.date && isSameDay(d.date, date));
      data.push({
        date: format(date, 'MMM d'),
        calories: dayData ? dayData.totals.calories : 0,
      });
    }
    return data;
  }, [dailyData]);
  
  return (
    <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle>{t('dashboard.chart-title')}</CardTitle>
        <CardDescription>{t('dashboard.chart-desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
            config={{
                calories: {
                    label: t('profile.goals-calories'),
                    color: 'hsl(var(--chart-1))',
                },
            }}
            className="h-[250px] w-full"
        >
            <ResponsiveContainer>
                <BarChart data={last7DaysData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="calories" fill="var(--color-calories)" radius={8} animationDuration={1500} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    