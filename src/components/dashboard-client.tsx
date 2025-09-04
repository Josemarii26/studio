
'use client';
import { useState, useMemo, useEffect } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProgressPanel } from './progress-panel';
import { DayDetailModal } from './day-detail-modal';
import { addDays, isSameDay } from 'date-fns';

const mockUserProfile: UserProfile = {
  name: 'Alex Doe',
  age: 30,
  gender: 'male',
  weight: 80,
  height: 180,
  goalWeight: 75,
  activityLevel: 'moderate',
  goal: 'lose',
  dailyCalorieGoal: 2200,
  dailyProteinGoal: 150,
  dailyFatGoal: 70,
  dailyCarbsGoal: 250,
  bmi: 24.7,
};

const generateMockData = () => {
    const data: DayData[] = [];
    const startDate = new Date();
    for(let i = 0; i < 20; i++) {
        const date = addDays(startDate, -i);
        const calories = 2000 + Math.floor(Math.random() * 800 - 400);
        let status: 'green' | 'yellow' | 'red' = 'green';
        if (Math.abs(calories - mockUserProfile.dailyCalorieGoal) > 400) {
            status = 'red';
        } else if (Math.abs(calories - mockUserProfile.dailyCalorieGoal) > 200) {
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
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  useEffect(() => {
    setIsClient(true);
    setDate(new Date());
    setDailyData(generateMockData());
  }, []);

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
  
  if (!isClient) {
    // Render a skeleton or null on the server to avoid hydration errors
    return <div className="min-h-screen"></div>;
  }

  return (
    <div className="flex flex-col gap-4">
        <Card className="shadow-lg">
            <CardContent className="p-2 sm:p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  onDayClick={handleDayClick}
                  className="p-0 [&_td]:p-0 w-full"
                  classNames={{
                    cell: 'w-full',
                    day: "h-16 lg:h-24 w-full rounded-lg text-center text-sm p-1",
                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] pb-2",
                    head_row: "flex w-full mt-2 justify-around",
                    row: "flex w-full mt-2 justify-around",
                    month: "space-y-4 w-full",
                    months: "w-full",
                    table: "w-full"
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

        <ProgressPanel dailyData={dailyData} userProfile={mockUserProfile} />

      {selectedDayData && (
        <DayDetailModal
          dayData={selectedDayData}
          userProfile={mockUserProfile}
          isOpen={!!selectedDayData}
          onClose={() => setSelectedDayData(null)}
        />
      )}
    </div>
  );
}
