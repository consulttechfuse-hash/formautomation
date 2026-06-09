'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePresence() {
  const supabase = createClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await fetch('/api/presence/heartbeat', { method: 'POST' });

      intervalRef.current = setInterval(async () => {
        await fetch('/api/presence/heartbeat', { method: 'POST' });
      }, 30000);
    };

    setupPresence();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'offline' })
      }).catch(() => {});
    };
  }, []);
}
