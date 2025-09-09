
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { NutriTrackLogo } from './nutri-track-logo';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCurrentLocale, useI18n } from '@/locales/client';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.641-3.657-11.303-8H6.306C9.656 39.663 16.318 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 36.678 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(data.email, data.password);
        toast({ title: t('auth.toast-login-success'), description: t('auth.toast-login-welcome') });
        router.push(`/${locale}/dashboard`);
      } else {
        await signUp(data.email, data.password);
        toast({ title: t('auth.toast-signup-success-title'), description: t('auth.toast-signup-success-desc') });
        // Don't redirect here, user needs to verify email first. The login page will show the verification message.
        setIsLogin(true); // Flip to login view after successful signup
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let title = isLogin ? t('auth.error-login-failed') : t('auth.error-signup-failed');
      let description;

      // Handle specific error codes from Firebase
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          description = t('auth.error-invalid-creds');
          break;
        case 'auth/wrong-password':
          description = t('auth.error-wrong-pass');
          break;
        case 'auth/email-already-in-use':
          description = t('auth.error-email-in-use');
          break;
        case 'auth/invalid-email':
            description = t('auth.error-invalid-email');
            break;
        case 'auth/weak-password':
            description = t('auth.error-weak-pass');
            break;
        default:
            // Use the custom error message from our provider for verification failures
            description = error.message || t('auth.error-unexpected');
      }

      toast({ variant: 'destructive', title, description });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        const userCredential = await signInWithGoogle();
        // Google sign-in often provides verified emails, but we check just in case.
        // If the user is new, they will be redirected to onboarding from the dashboard.
        toast({ title: t('auth.toast-google-success'), description: t('auth.toast-google-welcome') });
        router.push(`/${locale}/dashboard`);
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        toast({
            variant: "destructive",
            title: t('auth.error-google-failed'),
            description: ""
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="perspective">
      <Card className={cn(
          "w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm transition-transform duration-700 transform-style-preserve-3d",
          !isLogin && "rotate-y-180"
      )}>
        <div className="backface-hidden">
            <CardHeader className="text-center">
                <div className="mb-4 flex flex-col items-center">
                    <Link href={`/${locale}`}>
                        <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
                    </Link>
                </div>
              <CardTitle className="text-2xl">{t('auth.login-title')}</CardTitle>
              <CardDescription>{t('auth.login-desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.email-label')}</FormLabel>
                        <FormControl><Input {...field} placeholder="alex@email.com" type="email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.password-label')}</FormLabel>
                        <FormControl><Input {...field} placeholder="••••••••" type="password" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signin-btn')}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                {t('auth.no-account')}
                <Button variant="link" onClick={() => {
                    setIsLogin(false);
                    form.reset();
                }} className="px-1">
                  {t('auth.signup-btn')}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('auth.or-continue')}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}  disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <GoogleIcon />
                {t('auth.google-btn')}
              </Button>
              <p className="px-8 text-center text-sm text-muted-foreground">
                {t('auth.terms', { 
                    terms: (chunks) => <Link href="#" className="underline underline-offset-4 hover:text-primary">{chunks}</Link>,
                    privacy: (chunks) => <Link href="#" className="underline underline-offset-4 hover:text-primary">{chunks}</Link>
                })}
              </p>
            </CardContent>
        </div>

        <div className="absolute top-0 left-0 w-full h-full backface-hidden rotate-y-180">
            <CardHeader className="text-center">
                <div className="mb-4 flex flex-col items-center">
                    <Link href={`/${locale}`}>
                        <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
                    </Link>
                </div>
              <CardTitle className="text-2xl">{t('auth.signup-title')}</CardTitle>
              <CardDescription>{t('auth.signup-desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.email-label')}</FormLabel>
                        <FormControl><Input {...field} placeholder="alex@email.com" type="email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.password-label')}</FormLabel>
                        <FormControl><Input {...field} placeholder="••••••••" type="password" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signup-btn')}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                {t('auth.have-account')}
                <Button variant="link" onClick={() => {
                    setIsLogin(true);
                    form.reset();
                }} className="px-1">
                  {t('auth.signin-btn')}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('auth.or-continue')}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}  disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <GoogleIcon />
                {t('auth.google-btn')}
              </Button>
               <p className="px-8 text-center text-sm text-muted-foreground">
                 {t('auth.terms', { 
                    terms: (chunks) => <Link href="#" className="underline underline-offset-4 hover:text-primary">{chunks}</Link>,
                    privacy: (chunks) => <Link href="#" className="underline underline-offset-4 hover:text-primary">{chunks}</Link>
                })}
              </p>
            </CardContent>
        </div>
      </Card>
    </div>
  );
}
