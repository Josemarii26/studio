
'use client';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLoader } from "@/components/dashboard-loader";
import { useCurrentLocale } from '@/locales/client';
import { OnboardingForm } from "./onboarding-form";

interface OnboardingClientProps {
  vapidPublicKey: string;
}

export function OnboardingClient({ vapidPublicKey }: OnboardingClientProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const locale = useCurrentLocale();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${locale}/login`);
        } else if (!loading && user && !user.emailVerified) {
            // Redirect unverified users away from onboarding
            router.push(`/${locale}/dashboard`);
        }
    }, [user, loading, router, locale]);
    
    if (loading || !user) {
        return <DashboardLoader />;
    }

    return <OnboardingForm vapidPublicKey={vapidPublicKey} />;
}
