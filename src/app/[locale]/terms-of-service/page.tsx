
import { DietLogAILogo } from "@/components/diet-log-ai-logo";
import Link from "next/link";
import { useCurrentLocale } from '@/locales/client';

export default function TermsOfServicePage() {
    const locale = useCurrentLocale();
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 bg-background/80 backdrop-blur-sm border-b">
        <Link href={`/${locale}`} className="flex items-center gap-2">
            <DietLogAILogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">
                DietLogAI
            </h1>
        </Link>
      </header>
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-6 font-headline">Terms of Service</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

          <h2 className="text-foreground">1. Agreement to Terms</h2>
          <p>By using our application, DietLogAI, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the Application.</p>

          <h2 className="text-foreground">2. Description of Service</h2>
          <p>DietLogAI is an application that uses artificial intelligence to analyze your meal descriptions and provide nutritional information. The information provided is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>

          <h2 className="text-foreground">3. User Accounts</h2>
          <p>You must register for an account to access certain features of the Application. You are responsible for safeguarding your account and are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

          <h2 className="text-foreground">4. User Conduct</h2>
          <p>You agree not to use the Application to:</p>
          <ul>
            <li>Violate any local, state, national, or international law.</li>
            <li>Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, pornographic, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
            <li>Transmit any unsolicited or unauthorized advertising, promotional materials, "junk mail," "spam," "chain letters," "pyramid schemes," or any other form of solicitation.</li>
          </ul>

          <h2 className="text-foreground">5. Disclaimers</h2>
          <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DietLogAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          
           <h2 className="text-foreground">6. Limitation of Liability</h2>
          <p>In no event shall DietLogAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DietLogAI's website, even if DietLogAI or a DietLogAI authorized representative has been notified orally or in writing of the possibility of such damage.</p>

          <h2 className="text-foreground">7. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: <a href="mailto:terms@dietlog-ai.site">terms@dietlog-ai.site</a></p>
        </div>
      </main>
    </div>
  );
}
