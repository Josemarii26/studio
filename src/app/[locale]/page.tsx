
'use client';

import { Button } from "@/components/ui/button";
import { DietLogAILogo } from "@/components/diet-log-ai-logo";
import { ArrowRight, Bot, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useI18n, useCurrentLocale } from '@/locales/client';
import { LanguageSwitcher } from "@/components/language-switcher";

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg animate-fade-in-up">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}


export default function LandingPage() {
    const t = useI18n();
    const locale = useCurrentLocale();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 bg-background/80 backdrop-blur-sm border-b">
        <Link href={`/${locale}`} className="flex items-center gap-2">
            <DietLogAILogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">
                DietLogAI
            </h1>
        </Link>
        <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button asChild>
                <Link href={`/${locale}/login`}>
                    {t('landing.get-started')} <ArrowRight className="ml-2" />
                </Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 sm:py-32 px-4 overflow-hidden">
             <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
             <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-2/3 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-up font-headline" style={{ animationDelay: '0.1s' }}>
                        {t('landing.title')}
                    </h1>
                    <p className="max-w-2xl mx-auto md:mx-0 text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {t('landing.subtitle')}
                    </p>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Button asChild size="lg">
                            <Link href={`/${locale}/login`}>
                                {t('landing.cta')} <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="md:w-1/3 w-full max-w-sm md:max-w-none animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="relative w-full aspect-square">
                        <img src="https://dl.dropboxusercontent.com/scl/fi/bvysslzedz4np3pogkrk2/landing1.png?rlkey=dw7ewe3g78wd3byspd6loe6yf&st=mzag3sux&dl=0" alt="Healthy food" data-ai-hint="healthy food" className="object-cover" fill />
                    </div>
                </div>
            </div>
        </section>

        <section className="py-20 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">{t('landing.why-title')}</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Bot />}
                        title={t('landing.feature1-title')}
                        description={t('landing.feature1-desc')}
                    />
                     <FeatureCard
                        icon={<Zap />}
                        title={t('landing.feature2-title')}
                        description={t('landing.feature2-desc')}
                    />
                     <FeatureCard
                        icon={<TrendingUp />}
                        title={t('landing.feature3-title')}
                        description={t('landing.feature3-desc')}
                    />
                 </div>
            </div>
        </section>

        <section className="py-20 px-4 sm:px-8 bg-card/30">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">{t('landing.visualize-title')}</h2>
                    <p className="text-muted-foreground text-lg mb-6">{t('landing.visualize-desc')}</p>
                    <Button asChild variant="outline">
                        <Link href={`/${locale}/login`}>
                           {t('landing.visualize-cta')}
                        </Link>
                    </Button>
                </div>
                <div className="relative w-full max-w-md mx-auto aspect-video animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                   <img src="https://dl.dropboxusercontent.com/scl/fi/qoijb0dh4pfutgxpadwxk/landing2.png?rlkey=ak0jocqdipoimo8vkiug5d8gy&st=jam5ax7t&dl=0" alt="Dashboard preview" data-ai-hint="nutrition dashboard" className="object-cover" fill />
                </div>
            </div>
        </section>

      </main>

       <footer className="py-8 px-4 sm:px-8 border-t">
            <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} DietLogAI. {t('landing.footer-rights')}</p>
                <div className="mt-2 flex justify-center gap-4">
                    <Link href={`/${locale}/terms-of-service`} className="hover:text-primary transition-colors">{t('landing.footer-terms')}</Link>
                    <Link href={`/${locale}/privacy-policy`} className="hover:text-primary transition-colors">{t('landing.footer-privacy')}</Link>
                </div>
            </div>
       </footer>
    </div>
  );
}
