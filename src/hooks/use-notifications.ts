
'use client';

import { useEffect } from 'react';
import { messaging } from '@/firebase/client';
import { onMessage } from 'firebase/messaging';
import { useToast } from './use-toast';

// This hook is now simplified to only handle incoming foreground messages.
// The permission request logic is moved to an explicit user action.
export function useNotifications() {
  const { toast } = useToast();

  // Effect for handling incoming foreground messages
  useEffect(() => {
    if (typeof window === 'undefined' || !messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received.', payload);
      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, [toast]);
}
