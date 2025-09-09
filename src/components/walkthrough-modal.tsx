
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DietLogAILogo } from './diet-log-ai-logo';
import { Calendar, MessageSquare, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useI18n } from '@/locales/client';

interface WalkthroughModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function WalkthroughModal({ isOpen, onComplete }: WalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = useI18n();

  const steps = [
    {
      icon: <DietLogAILogo className="h-12 w-12 text-primary" />,
      title: t('walkthrough.step1-title'),
      description: t('walkthrough.step1-desc'),
      image: "https://picsum.photos/600/401",
      imageHint: "welcome illustration",
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary" />,
      title: t('walkthrough.step2-title'),
      description: t('walkthrough.step2-desc'),
      image: "https://picsum.photos/600/402",
      imageHint: "calendar interface",
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      title: t('walkthrough.step3-title'),
      description: t('walkthrough.step3-desc'),
      highlightedText: t('walkthrough.step3-highlight'),
      image: "https://picsum.photos/600/403",
      imageHint: "chatbot conversation",
    },
    {
      icon: <User className="h-12 w-12 text-primary" />,
      title: t('walkthrough.step4-title'),
      description: t('walkthrough.step4-desc'),
      image: "https://picsum.photos/600/404",
      imageHint: "user profile page",
    },
  ];

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
                    {t('walkthrough.prev-btn')}
                </Button>
            ) : (
                <div></div> // Placeholder to keep the 'Next' button on the right
            )}
          
            <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? t('dashboard.walkthrough-complete-btn') : t('walkthrough.next-btn')}
                {currentStep < steps.length - 1 && <ArrowRight className="ml-2"/>}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
