
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NutriTrackLogo } from './nutri-track-logo';
import { Calendar, MessageSquare, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface WalkthroughModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: <NutriTrackLogo className="h-12 w-12 text-primary" />,
    title: "Welcome to NutriTrackAI!",
    description: "Let's take a quick tour to get you started on your nutritional journey.",
    image: "https://picsum.photos/600/401",
    imageHint: "welcome illustration",
  },
  {
    icon: <Calendar className="h-12 w-12 text-primary" />,
    title: "The Calendar Dashboard",
    description: "This is your mission control. Every day you log your meals, the calendar will light up with a color showing how close you were to your goals. Green is on-target, yellow is close, and red is a bit off.",
    image: "https://picsum.photos/600/402",
    imageHint: "calendar interface",
  },
  {
    icon: <MessageSquare className="h-12 w-12 text-primary" />,
    title: "The AI Chat",
    description: "This is where the magic happens. Instead of manually entering every item, just tell the AI what you ate throughout the day. You can only successfully log your meals once per day, so give it a full summary!",
    highlightedText: "IMPORTANT: The idea is to do this once at the end of the day.",
    image: "https://picsum.photos/600/403",
    imageHint: "chatbot conversation",
  },
  {
    icon: <User className="h-12 w-12 text-primary" />,
    title: "Your Profile & Goals",
    description: "Click your avatar in the top right to visit your profile. You can see all your stats, goals, and even change your profile picture. That's it! You're all set to start tracking.",
    image: "https://picsum.photos/600/404",
    imageHint: "user profile page",
  },
];

export function WalkthroughModal({ isOpen, onComplete }: WalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader className="text-center items-center pt-4">
          <div className="mb-4">{step.icon}</div>
          <DialogTitle className="text-2xl font-bold font-headline">{step.title}</DialogTitle>
          <DialogDescription className="text-center px-4 space-y-2">
            <span>{step.description}</span>
            {step.highlightedText && (
                <strong className="block text-primary font-semibold">{step.highlightedText}</strong>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
            <Image 
                src={step.image} 
                alt={step.imageHint} 
                data-ai-hint={step.imageHint} 
                width={600} 
                height={400} 
                className="rounded-lg object-cover w-full aspect-video"
            />
        </div>
        <DialogFooter className="flex-row justify-between w-full">
            {currentStep > 0 ? (
                <Button variant="outline" onClick={handlePrev}>
                    <ArrowLeft className="mr-2"/>
                    Previous
                </Button>
            ) : (
                <div></div> // Placeholder to keep the 'Next' button on the right
            )}
          
            <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
                {currentStep < steps.length - 1 && <ArrowRight className="ml-2"/>}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
