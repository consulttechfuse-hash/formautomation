'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StatusToggle() {
  const [status, setStatus] = useState<'online' | 'away' | 'invisible'>('online');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_presence')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (data && ['online', 'away', 'invisible'].includes(data.status)) {
      setStatus(data.status);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: 'online' | 'away' | 'invisible') => {
    setLoading(true);
    const response = await fetch('/api/presence/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      setStatus(newStatus);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>;
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => updateStatus('online')}
        className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${
          status === 'online' 
            ? 'bg-green-500 text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        Online
      </button>
      <button
        onClick={() => updateStatus('away')}
        className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${
          status === 'away' 
            ? 'bg-yellow-500 text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        Away
      </button>
      <button
        onClick={() => updateStatus('invisible')}
        className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${
          status === 'invisible' 
            ? 'bg-gray-500 text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        Invisible
      </button>
    </div>
  );
}
