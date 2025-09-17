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
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { useUserStore } from '@/hooks/use-user-store';
import { useRouter } from 'next/navigation';
import { Loader2, Bell, BellOff } from 'lucide-react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { useAuth } from '@/hooks/use-auth';
import { requestNotificationPermission } from '@/firebase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(13, "You must be at least 13.").max(120),
  gender: z.enum(['male', 'female', 'other']),
  weight: z.coerce.number().min(30, "Weight must be at least 30."),
  height: z.coerce.number().min(100, "Height must be at least 100 cm."),
  goalWeight: z.coerce.number().min(30, "Goal weight must be a positive number."),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'intense']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  supplementation: z.enum(['none', 'creatine', 'protein', 'both']),
});

type FormData = z.infer<typeof formSchema>;


export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile, setUserProfile } = useUserStore();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const t = useI18n();
  const locale = useCurrentLocale();

  const STEPS = [
    { id: '01', name: t('onboarding.step1-name'), fields: ['name', 'age', 'gender'] },
    { id: '02', name: t('onboarding.step2-name'), fields: ['weight', 'height', 'goalWeight'] },
    { id: '03', name: t('onboarding.step3-name'), fields: ['activityLevel', 'goal'] },
    { id: '04', name: t('onboarding.step4-name'), fields: ['supplementation'] },
    { id: '05', name: t('onboarding.step5-name'), fields: [] },
    { id: '06', name: t('onboarding.step6-name'), fields: [] },
  ];
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', gender: 'female', activityLevel: 'light', goal: 'maintain', supplementation: 'none' },
  });
  
  const processForm = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Calculate BMR
    let bmr;
    if (data.gender === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }

    // Adjust for activity level
    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, intense: 1.725 };
    let tdee = bmr * activityMultipliers[data.activityLevel];

    // Adjust for goal
    const goalAdjustments = { lose: -500, maintain: 0, gain: 300 };
    const dailyCalories = Math.round(tdee + goalAdjustments[data.goal]);
    
    // Calculate BMI
    const heightInMeters = data.height / 100;
    const bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));

    // Calculate macros
    const dailyProteinGoal = Math.round((dailyCalories * 0.30) / 4);
    const dailyFatGoal = Math.round((dailyCalories * 0.30) / 9);
    const dailyCarbsGoal = Math.round((dailyCalories * 0.40) / 4);
    
    // Create the initial profile
    const profile: UserProfile = {
      ...data,
      dailyCalorieGoal: dailyCalories,
      dailyProteinGoal,
      dailyFatGoal,
      dailyCarbsGoal,
      bmi,
      photoUrl: null,
      pushSubscription: null, // Always start with null
      welcomeNotificationSent: false,
    }
    
    // Save profile and move to the next step
    await setUserProfile(profile);
    setIsSubmitting(false);
    setCurrentStep(prev => prev + 1);
  };
  
  const handleEnableNotifications = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        const token = await requestNotificationPermission();
        if (token && userProfile) {
            // Update the user profile with the new token
            await setUserProfile({ ...userProfile, pushSubscription: token });
            toast({ title: t('notifications.permission-granted-title') });
        }
    } catch(err) {
        console.error("Error enabling notifications:", err);
    } finally {
        setIsSubmitting(false);
        setCurrentStep(prev => prev + 1); // Move to final step regardless
    }
  }
  
  const handleSkipNotifications = () => {
      setCurrentStep(prev => prev + 1);
  }

  const next = async () => {
    const fields = STEPS[currentStep].fields;
    if (fields.length > 0) {
      const output = await form.trigger(fields as (keyof FormData)[], { shouldFocus: true });
      if (!output) return;
    }

    if (currentStep === STEPS.length - 3) { // On step 4, just before notifications
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
        <CardTitle>{t('onboarding.form-title')}</CardTitle>
        <CardDescription>{t('onboarding.form-step', { currentStep: currentStep + 1, totalSteps: STEPS.length, stepName: STEPS[currentStep].name })}</CardDescription>
        <Progress value={((currentStep) / (STEPS.length - 1)) * 100} className="w-full mt-2" />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)}>
          <CardContent className="min-h-[250px]">
            {currentStep === 0 && (
              <div className="space-y-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.name-label')}</FormLabel>
                    <FormControl><Input {...field} placeholder="Alex Doe" /></FormControl><FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('onboarding.age-label')}</FormLabel>
                      <FormControl><Input {...field} type="number" placeholder="30" /></FormControl><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('onboarding.gender-label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('onboarding.gender-placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="male">{t('onboarding.gender-male')}</SelectItem>
                          <SelectItem value="female">{t('onboarding.gender-female')}</SelectItem>
                          <SelectItem value="other">{t('onboarding.gender-other')}</SelectItem>
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
                        <FormItem><FormLabel>{t('onboarding.height-label')}</FormLabel><FormControl><Input {...field} type="number" placeholder="180" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="weight" render={({ field }) => (
                        <FormItem><FormLabel>{t('onboarding.current-weight-label')}</FormLabel><FormControl><Input {...field} type="number" placeholder="80" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="goalWeight" render={({ field }) => (
                        <FormItem><FormLabel>{t('onboarding.goal-weight-label')}</FormLabel><FormControl><Input {...field} type="number" placeholder="75" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            )}

            {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="activityLevel" render={({ field }) => (
                        <FormItem><FormLabel>{t('onboarding.activity-label')}</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="sedentary" /></FormControl><FormLabel className="font-normal">{t('onboarding.activity-sedentary')}</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="light" /></FormControl><FormLabel className="font-normal">{t('onboarding.activity-light')}</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="moderate" /></FormControl><FormLabel className="font-normal">{t('onboarding.activity-moderate')}</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="intense" /></FormControl><FormLabel className="font-normal">{t('onboarding.activity-intense')}</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem><FormLabel>{t('onboarding.goal-label')}</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                     <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="lose" /></FormControl><FormLabel className="font-normal">{t('onboarding.goal-lose')}</FormLabel></FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="maintain" /></FormControl><FormLabel className="font-normal">{t('onboarding.goal-maintain')}</FormLabel></FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="gain" /></FormControl><FormLabel className="font-normal">{t('onboarding.goal-gain')}</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage />
                        </FormItem>
                    )} />
                </div>
            )}
            
            {currentStep === 3 && (
                 <FormField control={form.control} name="supplementation" render={({ field }) => (
                    <FormItem><FormLabel>{t('onboarding.supplements-label')}</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-2">
                                 <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="none" /></FormControl><FormLabel className="font-normal">{t('onboarding.supplements-none')}</FormLabel></FormItem>
                                 <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="creatine" /></FormControl><FormLabel className="font-normal">{t('onboarding.supplements-creatine')}</FormLabel></FormItem>
                                 <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="protein" /></FormControl><FormLabel className="font-normal">{t('onboarding.supplements-protein')}</FormLabel></FormItem>
                                 <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="both" /></FormControl><FormLabel className="font-normal">{t('onboarding.supplements-both')}</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem>
                )} />
            )}
            
            {currentStep === 4 && (
                <div className="text-center space-y-4 flex flex-col items-center">
                    <Bell className="w-16 h-16 text-primary" />
                    <h2 className="text-2xl font-bold">{t('onboarding.notifications-title')}</h2>
                    <p className="text-muted-foreground max-w-sm">{t('onboarding.notifications-desc')}</p>
                     <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={handleSkipNotifications} disabled={isSubmitting}>
                           <BellOff className="mr-2" />
                           {t('onboarding.notifications-skip-btn')}
                        </Button>
                        <Button type="button" onClick={handleEnableNotifications} disabled={isSubmitting}>
                           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2" />}
                           {t('onboarding.notifications-enable-btn')}
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 5 && userProfile && (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">{t('onboarding.summary-title')}</h2>
                    <p className="text-muted-foreground">{t('onboarding.summary-subtitle')}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="rounded-lg bg-muted p-4"><div className="text-sm text-muted-foreground">{t('onboarding.bmi-label')}</div><div className="text-3xl font-bold">{userProfile.bmi}</div></div>
                        <div className="rounded-lg bg-muted p-4"><div className="text-sm text-muted-foreground">{t('onboarding.calorie-goal-label')}</div><div className="text-3xl font-bold">{userProfile.dailyCalorieGoal.toLocaleString()}</div><div className="text-xs">kcal/day</div></div>
                    </div>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={prev} disabled={currentStep === 0 || currentStep >= 4}>{t('onboarding.back-btn')}</Button>
            
            {currentStep < 3 && (
                <Button type="button" onClick={next}>
                    {t('onboarding.next-btn')}
                </Button>
            )}
             {currentStep === 3 && (
                <Button type="button" onClick={next} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('onboarding.finish-btn')}
                </Button>
            )}
            {currentStep === 5 && (
                <Button type="button" onClick={() => {
                    toast({ title: t('onboarding.toast-complete'), description: t('onboarding.toast-complete-desc')});
                    router.push(`/${locale}/dashboard`);
                }}>{t('onboarding.dashboard-btn')}</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
