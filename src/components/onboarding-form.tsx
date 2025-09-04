
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(13, "You must be at least 13.").max(120),
  gender: z.enum(['male', 'female', 'other']),
  weight: z.coerce.number().min(30, "Weight must be a positive number."),
  height: z.coerce.number().min(100, "Height must be a positive number."),
  goalWeight: z.coerce.number().min(30, "Goal weight must be a positive number."),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'intense']),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: '01', name: 'Personal Info', fields: ['name', 'age', 'gender'] },
  { id: '02', name: 'Physical Stats', fields: ['weight', 'height', 'goalWeight'] },
  { id: '03', name: 'Goals & Lifestyle', fields: ['activityLevel', 'goal'] },
  { id: '04', name: 'Summary', fields: [] },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [summary, setSummary] = useState<{ bmi: number, calories: number } | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', gender: 'female', activityLevel: 'light', goal: 'maintain' },
  });

  const processForm = (data: FormData) => {
    let bmr;
    if (data.gender === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }

    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, intense: 1.725 };
    let tdee = bmr * activityMultipliers[data.activityLevel];

    const goalAdjustments = { lose: -500, maintain: 0, gain: 300 };
    const dailyCalories = Math.round(tdee + goalAdjustments[data.goal]);
    
    const heightInMeters = data.height / 100;
    const bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));

    setSummary({ bmi, calories: dailyCalories });
    setCurrentStep(prev => prev + 1);
  };

  const next = async () => {
    const fields = STEPS[currentStep].fields;
    const output = await form.trigger(fields as (keyof FormData)[], { shouldFocus: true });
    if (!output) return;

    if (currentStep === STEPS.length - 2) {
        await form.handleSubmit(processForm)();
    } else {
        setCurrentStep(prev => prev + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Your Profile Setup</CardTitle>
        <CardDescription>Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}</CardDescription>
        <Progress value={((currentStep) / (STEPS.length - 1)) * 100} className="w-full mt-2" />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)}>
          <CardContent className="min-h-[250px]">
            {currentStep === 0 && (
              <div className="space-y-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} placeholder="Alex Doe" /></FormControl><FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input {...field} type="number" placeholder="30" /></FormControl><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="height" render={({ field }) => (
                        <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input {...field} type="number" placeholder="180" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="weight" render={({ field }) => (
                        <FormItem><FormLabel>Current Weight (kg)</FormLabel><FormControl><Input {...field} type="number" placeholder="80" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="goalWeight" render={({ field }) => (
                        <FormItem><FormLabel>Goal Weight (kg)</FormLabel><FormControl><Input {...field} type="number" placeholder="75" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            )}

            {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="activityLevel" render={({ field }) => (
                        <FormItem><FormLabel>Activity Level</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="sedentary" /></FormControl><FormLabel className="font-normal">Sedentary (little to no exercise)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="light" /></FormControl><FormLabel className="font-normal">Light (exercise 1-3 days/week)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="moderate" /></FormControl><FormLabel className="font-normal">Moderate (exercise 3-5 days/week)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="intense" /></FormControl><FormLabel className="font-normal">Intense (exercise 6-7 days/week)</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem><FormLabel>Primary Goal</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                     <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="lose" /></FormControl><FormLabel className="font-normal">Lose Weight</FormLabel></FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="maintain" /></FormControl><FormLabel className="font-normal">Maintain Weight</FormLabel></FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="gain" /></FormControl><FormLabel className="font-normal">Gain Muscle</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage />
                        </FormItem>
                    )} />
                </div>
            )}

            {currentStep === 3 && summary && (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Your Personalized Plan</h2>
                    <p className="text-muted-foreground">Based on your info, here are your initial targets.</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="rounded-lg bg-muted p-4"><div className="text-sm text-muted-foreground">Your BMI</div><div className="text-3xl font-bold">{summary.bmi}</div></div>
                        <div className="rounded-lg bg-muted p-4"><div className="text-sm text-muted-foreground">Daily Calorie Goal</div><div className="text-3xl font-bold">{summary.calories.toLocaleString()}</div><div className="text-xs">kcal/day</div></div>
                    </div>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={prev} disabled={currentStep === 0}>Back</Button>
            {currentStep < STEPS.length - 1 && (
                <Button type="button" onClick={next}>
                    {currentStep === STEPS.length - 2 ? 'Calculate & Finish' : 'Next Step'}
                </Button>
            )}
            {currentStep === STEPS.length - 1 && (
                <Button type="button" onClick={() => {
                    toast({ title: "Onboarding Complete!", description: "Redirecting to your dashboard."});
                    setTimeout(() => window.location.href = '/dashboard', 1500);
                }}>Go to Dashboard</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
