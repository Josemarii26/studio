
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(data.email, data.password);
        toast({ title: 'Login Successful', description: "Welcome back!" });
        router.push('/dashboard');
      } else {
        await signUp(data.email, data.password);
        toast({ title: 'Account Created', description: "Let's set up your profile." });
        router.push('/onboarding');
      }
    } catch (error: any) {
      console.error("Auth Error Code:", error.code);
      let title = isLogin ? 'Login Failed' : 'Sign Up Failed';
      let description = 'An unexpected error occurred. Please try again.';

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          title = 'Login Failed';
          description = 'No account found with this email or password. Please try again.';
          break;
        case 'auth/wrong-password':
          title = 'Login Failed';
          description = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          title = 'Sign Up Failed';
          description = 'This email is already associated with an account. Please sign in instead.';
          break;
        case 'auth/invalid-email':
            title = 'Invalid Email';
            description = 'The email address you entered is not valid.';
            break;
        case 'auth/weak-password':
            title = 'Weak Password';
            description = 'Your password is too weak. Please choose a stronger password.';
            break;
        default:
            description = 'An unexpected error occurred. Please try again later.';
            break;
      }

      toast({ variant: 'destructive', title, description });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await signInWithGoogle();
        toast({ title: "Signed In Successfully!", description: "Welcome! Let's get your profile set up." });
        // A real app should check if the user is new or returning.
        // For now, we always go to onboarding.
        router.push('/onboarding');
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: "Could not sign in with Google at this time. Please try again or use email/password."
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
                    <Link href="/">
                        <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
                    </Link>
                </div>
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>Sign in to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input {...field} placeholder="••••••••" type="password" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                {"Don't have an account?"}
                <Button variant="link" onClick={() => {
                    setIsLogin(false);
                    form.reset();
                }} className="px-1">
                  Sign Up
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}  disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <GoogleIcon />
                Sign in with Google
              </Button>
              <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
        </div>

        <div className="absolute top-0 left-0 w-full h-full backface-hidden rotate-y-180">
            <CardHeader className="text-center">
                <div className="mb-4 flex flex-col items-center">
                    <Link href="/">
                        <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
                    </Link>
                </div>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>Fill out the form below to get started.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input {...field} placeholder="••••••••" type="password" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                {'Already have an account?'}
                <Button variant="link" onClick={() => {
                    setIsLogin(true);
                    form.reset();
                }} className="px-1">
                  Sign In
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}  disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <GoogleIcon />
                Sign in with Google
              </Button>
               <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
        </div>
      </Card>
    </div>
  );
}
