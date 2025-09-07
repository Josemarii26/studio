
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
import { I18nProviderClient } from '@/locales/client';
import { getStaticParams } from '@/locales/server';


export function generateStaticParams() {
  return getStaticParams()
}


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
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);


  return (
    <html lang={locale} suppressHydrationWarning>
       <head>
          <title>NutriTrackAI</title>
          <meta name="description" content="Track your nutrition with the power of AI." />
          <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234CAF50' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-leaf'%3E%3Cpath d='M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z'/%3E%3Cpath d='M12 21a10 10 0 0 0 10-10h-2a7 7 0 0 1-7 7z'/%3E%3Cpath d='M12 4a9.91 9.91 0 0 1 3.5 1.63A4 4 0 0 1 19.5 8C20.6 10.2 18 13 12 13s-8.6-2.8-7.5-5A4 4 0 0 1 8.5 4.37 9.91 9.91 0 0 1 12 4z'/%3E%3C/svg%3E" type="image/svg+xml" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#f5f8ee" />
          <link rel="apple-touch-icon" href="/leaf.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/leaf.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        </head>
      <body className="font-body antialiased">
         <I18nProviderClient locale={locale}>
            <AuthProvider>
                {isAppLoading && <SplashScreen />}
                <div className={cn("transition-opacity duration-500", isAppLoading ? "opacity-0" : "opacity-100")}>
                  {children}
                </div>
                <Toaster />
            </AuthProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
