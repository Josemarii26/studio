
import { OnboardingForm } from "@/components/onboarding-form";
import { DietLogAILogo } from "@/components/diet-log-ai-logo";
import { getI18n, getCurrentLocale } from '@/locales/server';
import { OnboardingClient } from "@/components/onboarding-client";


export default async function OnboardingPage({ params: { locale: currentLocale } }: { params: { locale: string } }) {
    const t = await getI18n();
    const locale = getCurrentLocale();
    // This now runs on the server, so we can safely access process.env
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

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
        {/* We pass the server-side variable as a prop to the client component */}
        <OnboardingClient vapidPublicKey={vapidPublicKey} />
      </div>
    </div>
  );
}
