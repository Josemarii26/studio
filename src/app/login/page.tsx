
'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutriTrackLogo } from "@/components/nutri-track-logo";
import Link from "next/link";
import { auth, provider } from '@/firebase/client';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.641-3.657-11.303-8H6.306C9.656 39.663 16.318 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 36.678 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    toast({
                        title: "Signed In Successfully!",
                        description: "Redirecting to your profile setup...",
                    });
                    router.push('/onboarding');
                }
            } catch (error: any) {
                console.error("Authentication failed:", error);
                toast({
                    variant: "destructive",
                    title: "Authentication Failed",
                    description: `Could not sign you in. ${error.message}`,
                });
            }
        };

        handleRedirectResult();
    }, [router, toast]);


    const handleSignIn = async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error: any) {
            console.error("Authentication failed:", error);
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: `Could not sign you in. ${error.message}`,
            });
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex flex-col items-center">
                <Link href="/">
                    <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
                </Link>
            </div>
          <CardTitle className="text-2xl">Welcome to NutriTrackAI</CardTitle>
          <CardDescription>Sign up to start your personalized nutrition journey.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" className="w-full" onClick={handleSignIn}>
            <GoogleIcon />
            Sign up with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
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
      </Card>
    </div>
  );
}
