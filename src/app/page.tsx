
'use client';

import { Button } from "@/components/ui/button";
import { NutriTrackLogo } from "@/components/nutri-track-logo";
import { ArrowRight, Bot, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 bg-background/80 backdrop-blur-sm border-b">
        <Link href="/" className="flex items-center gap-2">
            <NutriTrackLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">
                NutriTrackAI
            </h1>
        </Link>
        <Button asChild>
            <Link href="/login">
                Get Started <ArrowRight className="ml-2" />
            </Link>
        </Button>
      </header>

      <main className="flex-1">
        <section className="relative text-center py-20 sm:py-32 px-4 flex flex-col items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
             <div className="relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-up font-headline" style={{ animationDelay: '0.1s' }}>
                    Transform Your Nutrition with AI
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Stop guessing. Start tracking. NutriTrackAI analyzes your meals to give you personalized insights and help you reach your health goals faster.
                </p>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <Button asChild size="lg">
                        <Link href="/login">
                            Start Your Journey Free <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        <section className="py-20 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Why NutriTrackAI?</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Bot />}
                        title="AI-Powered Analysis"
                        description="Simply describe your meals and our AI will instantly calculate calories, macros, and provide actionable insights."
                    />
                     <FeatureCard
                        icon={<Zap />}
                        title="Effortless Tracking"
                        description="No more manual entry. Our conversational interface makes logging your food as simple as sending a text message."
                    />
                     <FeatureCard
                        icon={<TrendingUp />}
                        title="Achieve Your Goals"
                        description="Whether you want to lose weight, gain muscle, or maintain, get a clear view of your progress and stay motivated."
                    />
                 </div>
            </div>
        </section>

        <section className="py-20 px-4 sm:px-8 bg-card/30">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Visualize Your Progress</h2>
                    <p className="text-muted-foreground text-lg mb-6">Go beyond numbers. Our beautiful, interactive charts and calendar give you a clear and intuitive understanding of your habits and trends over time.</p>
                    <Button asChild variant="outline">
                        <Link href="/login">
                           See It In Action
                        </Link>
                    </Button>
                </div>
                <div className="relative w-full aspect-square max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                   <Image src="https://picsum.photos/800/800" alt="Dashboard preview" data-ai-hint="nutrition dashboard" className="rounded-xl shadow-2xl" layout="fill" objectFit="cover" />
                </div>
            </div>
        </section>

      </main>

       <footer className="py-8 px-4 sm:px-8 border-t">
            <div className="max-w-6xl mx-auto text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} NutriTrackAI. All rights reserved.</p>
            </div>
       </footer>
    </div>
  );
}
