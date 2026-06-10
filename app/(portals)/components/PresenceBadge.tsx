'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatSAST } from '@/lib/timezone';

interface PresenceBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showLastSeen?: boolean;
}

export default function PresenceBadge({ userId, size = 'sm', showLastSeen = false }: PresenceBadgeProps) {
  const [status, setStatus] = useState<'online' | 'away' | 'offline' | 'invisible'>('offline');
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPresence();

    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setStatus(payload.new.status);
            setLastSeen(payload.new.last_seen_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadPresence = async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('status, last_seen_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        setStatus('offline');
        setLoading(false);
        return;
      }

      if (data) {
        setStatus(data.status || 'offline');
        setLastSeen(data.last_seen_at);
      }
    } catch (err) {
      setStatus('offline');
    }
    setLoading(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'invisible': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getLastSeenText = () => {
    if (!lastSeen) return 'Never';
    
    try {
      // Parse the SAST timestamp and format locally
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - lastSeenDate.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      
      if (diffSeconds < 60) return 'Just now';
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
      if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
      return `${Math.floor(diffSeconds / 86400)}d ago`;
    } catch (e) {
      return 'Unknown';
    }
  };

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  if (loading) {
    return <div className={`${sizeClasses[size]} bg-gray-300 rounded-full animate-pulse`} />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} ${getStatusColor()} rounded-full ring-2 ring-white`} />
      {showLastSeen && status !== 'online' && (
        <span className="text-xs text-gray-500">Last seen {getLastSeenText()}</span>
      )}
      {showLastSeen && status === 'online' && (
        <span className="text-xs text-green-600">Online</span>
      )}
    </div>
  );
}
