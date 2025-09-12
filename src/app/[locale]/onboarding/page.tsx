
'use client';

import { OnboardingForm } from "@/components/onboarding-form";
import { DietLogAILogo } from "@/components/diet-log-ai-logo";
import { useI18n, useCurrentLocale } from '@/locales/client';
import { OnboardingClient } from "@/components/onboarding-client";


export default function OnboardingPage() {
    const t = useI18n();
    const locale = useCurrentLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
            <a href={`/${locale}`}>
              <DietLogAILogo className="h-12 w-12 text-primary mb-4" />
            </a>
            <h1 className="text-3xl font-bold font-headline">{t('onboarding.welcome')}</h1>
            <p className="text-muted-foreground">{t('onboarding.subtitle')}</p>
        </div>
        <OnboardingClient />
      </div>
    </div>
  );
}
