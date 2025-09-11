
import { DietLogAILogo } from "@/components/diet-log-ai-logo";
import Link from "next/link";
import { useCurrentLocale } from '@/locales/client';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-bold mb-6 font-headline">Privacy Policy</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <h2 className="text-foreground">1. Introduction</h2>
          <p>Welcome to DietLogAI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
          
          <h2 className="text-foreground">2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Application.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
            <li><strong>Data from Social Networks:</strong> User information from social networking sites, such as Apple, Facebook, Google, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.</li>
          </ul>

          <h2 className="text-foreground">3. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
          </ul>

          <h2 className="text-foreground">4. Data Deletion</h2>
          <p>You have the right to request the deletion of your personal data. To do so, please follow these steps:</p>
          <ol>
            <li>Log in to your DietLogAI account.</li>
            <li>Navigate to your Profile page.</li>
            <li>You will find an option to "Delete Account". Clicking this will permanently delete your account and all associated data, including your profile, meal logs, and chat history.</li>
            <li>Alternatively, you can send an email to <a href="mailto:privacy@dietlog-ai.site">privacy@dietlog-ai.site</a> with the subject line "Data Deletion Request" from the email address associated with your account. We will process your request within 30 days.</li>
          </ol>

          <h2 className="text-foreground">5. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@dietlog-ai.site">privacy@dietlog-ai.site</a></p>
        </div>
      </main>
    </div>
  );
}
