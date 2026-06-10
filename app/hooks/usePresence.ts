'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePresence() {
  const supabase = createClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only initialize once
      if (initializedRef.current) return;
      initializedRef.current = true;

      // First, ensure a record exists
      await fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'online' })
      }).catch(() => {});

      // Set heartbeat every 30 seconds
      intervalRef.current = setInterval(async () => {
        await fetch('/api/presence/heartbeat', { method: 'POST' });
      }, 30000);
    };

    setupPresence();

    // Handle page/tab close
    const handleBeforeUnload = () => {
      fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'offline' })
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'offline' })
      }).catch(() => {});
    };
  }, []);
}
