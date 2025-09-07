
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthContext, useAuth } from '@/hooks/use-auth';
import { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/firebase/client';
import { SplashScreen } from '@/components/splash-screen';
import { cn } from '@/lib/utils';

// This can't be in the layout component directly, as Metadata can't be exported from a client component.
// We can define it separately.
// export const metadata: Metadata = {
//   title: 'NutriTrackAI',
//   description: 'Track your nutrition with the power of AI.',
// };

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };
  
  const value = { user, loading, signIn, signUp, signOut, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NutriTrackAI</title>
        <meta name="description" content="Track your nutrition with the power of AI." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#34d399" />
        <link rel="apple-touch-icon" href="/favicon.svg"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            {isAppLoading && <SplashScreen />}
            <div className={cn("transition-opacity duration-500", isAppLoading ? "opacity-0" : "opacity-100")}>
              {children}
            </div>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
