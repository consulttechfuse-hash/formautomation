'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
      .channel('presence-changes')
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
    const { data } = await supabase
      .from('user_presence')
      .select('status, last_seen_at')
      .eq('user_id', userId)
      .single();

    if (data) {
      setStatus(data.status);
      setLastSeen(data.last_seen_at);
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
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
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
