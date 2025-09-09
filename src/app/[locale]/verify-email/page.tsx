
'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { DietLogAILogo } from '@/components/diet-log-ai-logo';

export default function VerifyEmailPage() {
    const t = useI18n();
    const locale = useCurrentLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 text-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold">{t('auth.verify-success-title')}</CardTitle>
                <CardDescription>{t('auth.verify-success-desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href={`/${locale}/login`}>{t('auth.verify-success-btn')}</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
