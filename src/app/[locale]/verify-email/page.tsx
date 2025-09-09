
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutriTrackLogo } from "@/components/nutri-track-logo";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function VerifyEmailContent() {
  const t = useI18n();
  const locale = useCurrentLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold font-headline">{t('auth.verify-success-title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {t('auth.verify-success-desc')}
          </CardDescription>
        </CardContent>
        <CardContent>
           <Button asChild>
                <Link href={`/${locale}/login`}>{t('auth.verify-success-btn')}</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
