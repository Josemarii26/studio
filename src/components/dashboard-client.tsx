
'use client';
import { useState, useMemo, useEffect } from 'react';
import type { DayData, UserProfile } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ProgressPanel } from './progress-panel';
import { DayDetailModal } from './day-detail-modal';
import { isSameDay, startOfYesterday, differenceInDays, isToday, startOfToday } from 'date-fns';
import { es as esLocale, enUS as enUSLocale } from 'date-fns/locale';
import { CaloriesChart } from './calories-chart';
import { AchievementsGrid } from './achievements-grid';
import { useUserStore } from '@/hooks/use-user-store';
import { DashboardLoader } from './dashboard-loader';
import { useSidebar } from './ui/sidebar';
import { useI18n, useCurrentLocale } from '@/locales/client';


interface DashboardClientProps {
  dailyData: DayData[];
}

function CalendarLegend() {
    const t = useI18n();
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-green/50 border border-status-green" />
                <span>{t('dashboard.legend-on-target')}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-yellow/50 border border-status-yellow" />
                <span>{t('dashboard.legend-close')}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-red/50 border border-status-red" />
                <span>{t('dashboard.legend-off-target')}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted/80 border border-muted-foreground/30" />
                <span>{t('dashboard.legend-missed')}</span>
            </div>
        </div>
    )
}

export function DashboardClient({ dailyData }: DashboardClientProps) {
  const { userProfile, isLoaded: isProfileLoaded } = useUserStore();
  const { toggleSidebar } = useSidebar();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const t = useI18n();
  const locale = useCurrentLocale();
  const dateFnsLocale = locale === 'es' ? esLocale : enUSLocale;


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
            observations: t('dashboard.modal-no-data'),
            creatineTaken: false,
            proteinTaken: false
        });
    }
  };
  
  // When an analysis is complete, select today's data to show the modal
  useEffect(() => {
    const todayData = dailyData.find(d => isSameDay(d.date, new Date()));
    if(todayData && Object.keys(todayData.meals).length > 0){
        // Don't re-open the modal if it was just closed by the user
        if(!selectedDayData) {
             setSelectedDayData(todayData);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyData]);


  const modifiers = useMemo(() => {
    const loggedDates = dailyData.map(d => d.date.toDateString());
    const yesterday = startOfYesterday();
    
    const firstLogDate = dailyData.length > 0 
      ? dailyData.reduce((earliest, current) => current.date < earliest.date ? current : earliest, dailyData[0]).date
      : new Date();

    const missedDays = [];
    if (dailyData.length > 0) {
        const daysSinceFirstLog = differenceInDays(yesterday, firstLogDate);
        for (let i = 0; i <= daysSinceFirstLog; i++) {
            const dateToCheck = new Date(firstLogDate);
            dateToCheck.setDate(dateToCheck.getDate() + i);
            if (!loggedDates.includes(dateToCheck.toDateString()) && dateToCheck <= yesterday) {
                missedDays.push(dateToCheck);
            }
        }
    }

    const today = startOfToday();
    const hasDataForToday = dailyData.some(d => isSameDay(d.date, today));

    return {
        green: dailyData.filter(d => d.status === 'green').map(d => d.date),
        yellow: dailyData.filter(d => d.status === 'yellow').map(d => d.date),
        red: dailyData.filter(d => d.status === 'red').map(d => d.date),
        missed: missedDays,
        today: hasDataForToday ? [] : [today], // Only apply today style if no data
        disabled: { after: new Date() },
    }
  }, [dailyData]);
  
  if (!isProfileLoaded || !userProfile) {
    return <DashboardLoader />;
  }

  const goalTextMap: { [key: string]: string } = {
    lose: t('dashboard.goal-lose'),
    maintain: t('dashboard.goal-maintain'),
    gain: t('dashboard.goal-gain'),
  };

  const goalText = goalTextMap[userProfile.goal] || '';
  
  const handleGoToChat = () => {
    setSelectedDayData(null);
    toggleSidebar();
  }

  return (
    <div className="space-y-8">
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold font-headline">{t('dashboard.welcome-back', {name: userProfile.name.split(' ')[0]})}</h1>
            <p className="text-muted-foreground">{t('dashboard.welcome-subtitle', { goal: goalText })}</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg bg-background/50 backdrop-blur-xl animate-fade-in-up w-full p-2 sm:p-0" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-0 sm:p-6">
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
                            missed: 'rdp-day_missed',
                            selected: 'text-foreground',
                            today: 'ring-2 ring-primary/80 animate-pulse-ring'
                        }}
                        locale={dateFnsLocale}
                    />
                </CardContent>
                <CardFooter className="py-4 justify-center">
                    <CalendarLegend />
                </CardFooter>
            </Card>
          <CaloriesChart dailyData={dailyData} />
        </div>
        
        <div className="lg:col-span-1">
          <ProgressPanel dailyData={dailyData} />
        </div>
      </div>
      
      <div className="mx-auto mt-8">
        <h2 className="text-2xl font-bold font-headline mb-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>{t('dashboard.achievements-title')}</h2>
        <AchievementsGrid dailyData={dailyData} userProfile={userProfile} />
      </div>

      {selectedDayData && userProfile && (
        <DayDetailModal
          dayData={selectedDayData}
          userProfile={userProfile}
          isOpen={!!selectedDayData}
          onClose={() => setSelectedDayData(null)}
          onGoToChat={handleGoToChat}
        />
      )}
    </div>
  );
}
