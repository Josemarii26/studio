
'use client';
import { useState, useMemo, useEffect } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProgressPanel } from './progress-panel';
import { DayDetailModal } from './day-detail-modal';
import { addDays, isSameDay, startOfToday } from 'date-fns';
import { CaloriesChart } from './calories-chart';
import { DashboardGrid } from './dashboard-grid';
import { useUserStore } from '@/hooks/use-user-store';
import { DashboardLoader } from './dashboard-loader';
import { parseNutritionalAnalysis } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface DashboardClientProps {
  analysisResult: { analysis: string, creatineTaken: boolean, proteinTaken: boolean } | null;
}

export function DashboardClient({ analysisResult }: DashboardClientProps) {
  const { userProfile, isLoaded } = useUserStore();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  const dataKey = user ? `dailyData-${user.uid}` : null;

  // Load data from localStorage when the component mounts or user changes
  useEffect(() => {
    if (dataKey) {
      const storedData = localStorage.getItem(dataKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData).map((d: any) => ({
            ...d,
            date: new Date(d.date),
          }));
          setDailyData(parsedData);
        } catch (error) {
          console.error("Failed to parse dailyData from localStorage", error);
          setDailyData([]);
        }
      }
    } else {
        setDailyData([]);
    }
  }, [dataKey]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (dataKey && dailyData.length > 0) {
      localStorage.setItem(dataKey, JSON.stringify(dailyData));
    }
  }, [dailyData, dataKey]);


  useEffect(() => {
    if (analysisResult && userProfile) {
      handleAnalysis(analysisResult);
    }
  }, [analysisResult, userProfile]);


  const handleDayClick = (day: Date) => {
    const dataForDay = dailyData.find(d => isSameDay(d.date, day));
    if (dataForDay) {
      setSelectedDayData(dataForDay);
    } else {
        setSelectedDayData({
            date: day,
            meals: {},
            totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
            status: 'yellow',
            observations: "No data logged for this day. Use the chat to add your meals!"
        });
    }
  };
  
   const handleAnalysis = (result: { analysis: string, creatineTaken: boolean, proteinTaken: boolean }) => {
    if (!userProfile) return;

    const parsedData = parseNutritionalAnalysis(result.analysis, userProfile);
    const today = startOfToday();
    const newDayData: DayData = {
      date: today,
      ...parsedData,
      creatineTaken: result.creatineTaken,
      proteinTaken: result.proteinTaken,
    };
    
    setDailyData(prevData => {
        const otherDays = prevData.filter(d => !isSameDay(d.date, today));
        return [newDayData, ...otherDays];
    });

    setSelectedDayData(newDayData);
  };


  const modifiers = useMemo(() => ({
    green: dailyData.filter(d => d.status === 'green').map(d => d.date),
    yellow: dailyData.filter(d => d.status === 'yellow').map(d => d.date),
    red: dailyData.filter(d => d.status === 'red').map(d => d.date),
  }), [dailyData]);
  
  if (!isLoaded || !userProfile) {
    return <DashboardLoader />;
  }

  const goalText = {
    lose: 'losing weight',
    maintain: 'maintaining your weight',
    gain: 'gaining muscle',
  };

  return (
    <div className="space-y-8">
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold font-headline">Welcome back, {userProfile.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">You're on track for your goal of {goalText[userProfile.goal]}. Let's review your progress.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg bg-background/50 backdrop-blur-xl animate-fade-in-up w-full">
                <CardContent className="p-0 sm:p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        onDayClick={handleDayClick}
                        className="p-0 w-full"
                        modifiers={modifiers}
                        modifiersClassNames={{
                            green: 'rdp-day_green',
                            yellow: 'rdp-day_yellow',
                            red: 'rdp-day_red',
                        }}
                    />
                </CardContent>
            </Card>
          <CaloriesChart dailyData={dailyData} />
        </div>
        
        <div className="lg:col-span-1">
          <ProgressPanel dailyData={dailyData} />
        </div>
      </div>
      
      <div className="mx-auto @container mt-8">
        <h2 className="text-2xl font-bold font-headline mb-4 animate-fade-in-up">Your Journey</h2>
        <DashboardGrid />
      </div>

      {selectedDayData && userProfile && (
        <DayDetailModal
          dayData={selectedDayData}
          userProfile={userProfile}
          isOpen={!!selectedDayData}
          onClose={() => setSelectedDayData(null)}
        />
      )}
    </div>
  );
}
