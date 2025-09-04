
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutriTrackLogo } from "@/components/nutri-track-logo";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mb-4 flex flex-col items-center">
                <Link href="/">
                    <NutriTrackLogo className="h-12 w-12 text-primary mb-4" />
                </Link>
            </div>
          <CardTitle className="text-2xl">Welcome to NutriTrackAI</CardTitle>
          <CardDescription>Sign in or create an account to start your personalized nutrition journey.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm />
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
