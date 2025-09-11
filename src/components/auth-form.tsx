
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
import { DietLogAILogo } from './diet-log-ai-logo';
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

const AppleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19.3,4.88c-1.38-1.46-3.4-2-5.3-2s-3.92.54-5.3,2a6.3,6.3,0,0,0-2,5.13c0,2.63,1.5,5.17,3.6,6.86,1.18.94,2.5,1.93,4,1.93,1.4,0,2.62-1,3.8-1.93,2.1-1.69,3.6-4.23,3.6-6.86A6.3,6.3,0,0,0,19.3,4.88ZM15.53,3.47a2.29,2.29,0,0,1,1.17-1.35,2.44,2.44,0,0,0-1.17,1.35,2.37,2.37,0,0,0-1.17,1.35,2.44,2.44,0,0,1,1.17-1.35Z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="#1877F2" d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-1.5c-1.1,0-1.5,0.45-1.5,1.5V12h3l-0.5,3H13v6.95C18.05,21.45,22,17.19,22,12Z"/>
    </svg>
);


export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
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
        setIsLogin(true); 
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let title = isLogin ? t('auth.error-login-failed') : t('auth.error-signup-failed');
      let description;

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
            description = error.message || t('auth.error-unexpected');
      }

      toast({ variant: 'destructive', title, description });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    try {
        let userCredential;
        let providerName;
        if(provider === 'google') {
            userCredential = await signInWithGoogle();
            providerName = "Google";
        } else if(provider === 'facebook') {
            userCredential = await signInWithFacebook();
            providerName = "Facebook";
        } else {
            userCredential = await signInWithApple();
            providerName = "Apple";
        }
        toast({ title: `Signed in with ${providerName}!`, description: t('auth.toast-google-welcome') });
        router.push(`/${locale}/dashboard`);
    } catch (error: any) {
        console.error(`${provider} Sign-In Error:`, error);
        toast({
            variant: "destructive",
            title: `Could not sign in with ${provider}`,
            description: error.message || t('auth.error-unexpected'),
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
                        <DietLogAILogo className="h-12 w-12 text-primary mb-4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleSocialSignIn('google')}  disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  <span className="sm:hidden">Google</span>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleSocialSignIn('facebook')} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FacebookIcon />}
                    <span className="sm:hidden">Facebook</span>
                </Button>
                 <Button variant="outline" className="w-full" onClick={() => handleSocialSignIn('apple')} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
                    <span className="sm:hidden">Apple</span>
                </Button>
              </div>
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
                        <DietLogAILogo className="h-12 w-12 text-primary mb-4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleSocialSignIn('google')}  disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                   <span className="sm:hidden">Google</span>
                </Button>
                 <Button variant="outline" className="w-full" onClick={() => handleSocialSignIn('facebook')} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FacebookIcon />}
                     <span className="sm:hidden">Facebook</span>
                </Button>
                 <Button variant="outline" className="w-full" onClick={() => handleSocialSignIn('apple')} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
                     <span className="sm:hidden">Apple</span>
                </Button>
              </div>
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
