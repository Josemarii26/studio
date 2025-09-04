
'use client';
import { useState, useMemo, useEffect } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressPanel } from './progress-panel';
import { DayDetailModal } from './day-detail-modal';
import { addDays, isSameDay } from 'date-fns';
import { CaloriesChart } from './calories-chart';
import { DashboardGrid } from './dashboard-grid';
import { useUserStore } from '@/hooks/use-user-store';
import { DashboardLoader } from './dashboard-loader';

const generateMockData = (userProfile: UserProfile | null) => {
    const data: DayData[] = [];
    const startDate = new Date();
    if (!userProfile) return data;

    for(let i = 0; i < 20; i++) {
        const date = addDays(startDate, -i);
        const calories = userProfile.dailyCalorieGoal + Math.floor(Math.random() * 800 - 400);
        let status: 'green' | 'yellow' | 'red' = 'green';
        if (Math.abs(calories - userProfile.dailyCalorieGoal) > 400) {
            status = 'red';
        } else if (Math.abs(calories - userProfile.dailyCalorieGoal) > 200) {
            status = 'yellow';
        }
        data.push({
            date,
            meals: {
                breakfast: { description: 'Oatmeal with berries and nuts', calories: 450, protein: 15, fat: 15, carbs: 65 },
                lunch: { description: 'Grilled chicken salad with avocado', calories: 600, protein: 45, fat: 30, carbs: 30 },
                dinner: { description: `Salmon fillet with quinoa and roasted asparagus`, calories: 750, protein: 50, fat: 35, carbs: 55 },
                snack: { description: 'Greek yogurt', calories: 200, protein: 20, fat: 10, carbs: 10 },
            },
            totals: {
                calories,
                protein: 130,
                fat: 90,
                carbs: 160,
            },
            status,
            observations: 'A well-balanced day. Protein intake is excellent. Keep it up!',
        });
    }
    return data;
}

interface DashboardClientProps {
  onAnalysisUpdate: (data: any) => void;
}

export function DashboardClient({ onAnalysisUpdate }: DashboardClientProps) {
  const { userProfile, isLoaded } = useUserStore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  useEffect(() => {
    if (isLoaded && userProfile) {
      setDailyData(generateMockData(userProfile));
    }
  }, [isLoaded, userProfile]);

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
    <div className="space-y-6">
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold font-headline">Welcome back, {userProfile.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">You're on track for your goal of {goalText[userProfile.goal]}. Let's review your progress.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main Content: Calendar and Chart (takes 2/3 width on large screens) */}
            <div className="space-y-6 lg:col-span-2">
                <Card className="shadow-lg bg-background/50 backdrop-blur-xl animate-fade-in-up">
                    <CardContent className="p-2 sm:p-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            onDayClick={handleDayClick}
                            className="p-0"
                            classNames={{
                                cell: "w-full sm:w-12 h-12",
                                day: "w-full sm:w-12 h-12 rounded-lg",
                                head_cell: "w-full sm:w-12 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                month: "space-y-4 w-full"
                            }}
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

            {/* Side Panel: Progress (takes 1/3 width on large screens) */}
            <div className="lg:col-span-1">
              <ProgressPanel dailyData={dailyData} />
            </div>
        </div>
      
      {/* Full-width Image Grid */}
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
