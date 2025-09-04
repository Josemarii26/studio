import { OnboardingForm } from "@/components/onboarding-form";
import { NutriTrackLogo } from "@/components/nutri-track-logo";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
            <a href="/">
              <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
            </a>
            <h1 className="text-3xl font-bold font-headline">Welcome to NutriTrackAI</h1>
            <p className="text-muted-foreground">Let's set up your profile to personalize your experience.</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
