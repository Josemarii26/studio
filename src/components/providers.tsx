
'use client';

import { I18nProviderClient } from '@/locales/client';
import { AuthContext, useAuth } from '@/hooks/use-auth';
import { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, signInWithPopup, sendEmailVerification, UserCredential, ActionCodeSettings } from 'firebase/auth';
import { auth, provider } from '@/firebase/client';
import { SplashScreen } from '@/components/splash-screen';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/locales/client';

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useI18n();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            // Once the custom domain is configured, we can use actionCodeSettings
            // to redirect to a custom verification page.
            const actionCodeSettings: ActionCodeSettings = {
                // The URL must be whitelisted in the Firebase Console.
                // We use the custom domain now.
                url: `https://www.dietlog-ai.site/verify-email`,
                handleCodeInApp: true,
            };
            await sendEmailVerification(userCredential.user, actionCodeSettings);
        }
        return userCredential;
    } catch (error: any) {
        console.error("Error during sign up process:", error);
        throw error;
    }
  };
  
  const signInWithGoogle = async (): Promise<UserCredential> => {
    return await signInWithPopup(auth, provider);
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
  };
  
  const value = { user, loading, signIn, signUp, signOut, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function Providers({ children, locale }: { children: ReactNode, locale: string }) {
    const [isAppLoading, setIsAppLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
        setIsAppLoading(false);
        }, 1500); 

        return () => clearTimeout(timer);
    }, []);

    return (
        <I18nProviderClient locale={locale}>
            <AuthProvider>
                {isAppLoading && <SplashScreen />}
                <div className={cn("transition-opacity duration-500", isAppLoading ? "opacity-0" : "opacity-100")}>
                  {children}
                </div>
            </AuthProvider>
        </I18nProviderClient>
    )
}
