
'use client';
import { format, isToday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DayData, UserProfile, Meal } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
import { Separator } from '@/components/ui/separator';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Carrot, Pizza, Cookie, Soup, CheckCircle2, XCircle, Pill, MessageSquarePlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './ui/button';

interface DayDetailModalProps {
  dayData: DayData;
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onGoToChat: () => void;
}

const macroChartConfig = {
  protein: { label: 'Protein', color: 'hsl(var(--chart-1))' },
  carbs: { label: 'Carbs', color: 'hsl(var(--chart-2))' },
  fat: { label: 'Fat', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

const mealIcons: { [key: string]: ReactNode } = {
  breakfast: <Carrot className="h-5 w-5 mr-2 text-muted-foreground" />,
  lunch: <Pizza className="h-5 w-5 mr-2 text-muted-foreground" />,
  dinner: <Soup className="h-5 w-5 mr-2 text-muted-foreground" />,
  snack: <Cookie className="h-5 w-5 mr-2 text-muted-foreground" />,
};

const MEAL_ORDER: (keyof DayData['meals'])[] = ['breakfast', 'lunch', 'snack', 'dinner'];


export function DayDetailModal({ dayData, userProfile, isOpen, onClose, onGoToChat }: DayDetailModalProps) {
  const { date, meals, totals, observations, creatineTaken, proteinTaken } = dayData;
  
  const macroData = [
    { name: 'Protein', value: totals.protein, fill: 'var(--color-protein)' },
    { name: 'Carbs', value: totals.carbs, fill: 'var(--color-carbs)' },
    { name: 'Fat', value: totals.fat, fill: 'var(--color-fat)' },
  ];

  const hasData = totals.calories > 0;
  const isTodayAndEmpty = isToday(date) && !hasData;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Details for {format(date, 'MMMM d, yyyy')}</DialogTitle>
          <DialogDescription>{observations}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 md:grid-cols-5">
            <div className="md:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Macronutrient Split</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {hasData ? (
                         <ChartContainer config={macroChartConfig} className="mx-auto aspect-square h-[250px]">
                            <ResponsiveContainer>
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={macroData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5} cy="50%">
                                    </Pie>
                                    <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-mt-4" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                       ) : (
                        <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
                            No macro data available.
                        </div>
                       )}
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-3">
                <div className="grid grid-cols-2 gap-4 h-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calories</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-2">
                            <div className="text-5xl font-bold text-primary">{totals.calories.toLocaleString()}</div>
                            <div className="text-muted-foreground">/ {userProfile.dailyCalorieGoal.toLocaleString()} kcal goal</div>
                        </CardContent>
                    </Card>
                     <div className="grid grid-rows-3 gap-2">
                        <Card className="p-3">
                            <div className="text-sm font-medium">Protein</div>
                            <div className="text-lg font-bold">{totals.protein}g <span className="text-sm font-normal text-muted-foreground">/ {userProfile.dailyProteinGoal}g</span></div>
                        </Card>
                         <Card className="p-3">
                            <div className="text-sm font-medium">Carbs</div>
                            <div className="text-lg font-bold">{totals.carbs}g <span className="text-sm font-normal text-muted-foreground">/ {userProfile.dailyCarbsGoal}g</span></div>
                        </Card>
                         <Card className="p-3">
                            <div className="text-sm font-medium">Fat</div>
                            <div className="text-lg font-bold">{totals.fat}g <span className="text-sm font-normal text-muted-foreground">/ {userProfile.dailyFatGoal}g</span></div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
        
        {userProfile.supplementation !== 'none' && (
            <div>
                 <h3 className="mb-4 text-lg font-semibold">Supplement Intake</h3>
                 <Card>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                        {(userProfile.supplementation === 'creatine' || userProfile.supplementation === 'both') && (
                            <div className="flex items-center gap-2">
                                {creatineTaken ? <CheckCircle2 className="w-5 h-5 text-status-green" /> : <XCircle className="w-5 h-5 text-status-red" />}
                                <span className="font-medium">Creatine</span>
                            </div>
                        )}
                        {(userProfile.supplementation === 'protein' || userProfile.supplementation === 'both') && (
                            <div className="flex items-center gap-2">
                                {proteinTaken ? <CheckCircle2 className="w-5 h-5 text-status-green" /> : <XCircle className="w-5 h-5 text-status-red" />}
                                <span className="font-medium">Protein Powder</span>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
        )}

        <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Logged Meals</h3>
            <div className="space-y-4">
              {hasData ? (
                MEAL_ORDER.map(mealType => {
                    const mealData = meals[mealType];
                    if (!mealData) return null;
                    
                    return (
                        <Card key={mealType}>
                            <CardHeader className="p-4 flex flex-row items-center justify-between">
                                <div className="flex items-center">
                                    {mealIcons[mealType]}
                                    <CardTitle className="text-base capitalize">{mealType}</CardTitle>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold">{mealData.calories} kcal</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-muted-foreground mb-2">{mealData.description}</p>
                                <div className="text-xs text-muted-foreground flex items-center gap-4">
                                    <span><span className="font-medium text-foreground">{mealData.protein}g</span> Protein</span>
                                    <span><span className="font-medium text-foreground">{mealData.fat}g</span> Fat</span>
                                    <span><span className="font-medium text-foreground">{mealData.carbs}g</span> Carbs</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">No meals logged for this day.</div>
              )}
            </div>
        </div>
        {isTodayAndEmpty && (
             <DialogFooter className="mt-4">
                <Button onClick={onGoToChat}>
                    <MessageSquarePlus className="mr-2 h-4 w-4"/>
                    Log Today's Meals
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
