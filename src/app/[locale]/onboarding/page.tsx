
'use client';

import { OnboardingForm } from "@/components/onboarding-form";
import { NutriTrackLogo } from "@/components/nutri-track-logo";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLoader } from "@/components/dashboard-loader";
import { useI18n, useCurrentLocale } from '@/locales/client';


export default function OnboardingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const t = useI18n();
    const locale = useCurrentLocale();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [user, loading, router, locale]);
    
    if (loading || !user) {
        return <DashboardLoader />;
    }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
            <a href={`/${locale}`}>
              <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
            </a>
            <h1 className="text-3xl font-bold font-headline">{t('onboarding.welcome')}</h1>
            <p className="text-muted-foreground">{t('onboarding.subtitle')}</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
