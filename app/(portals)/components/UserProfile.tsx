'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Use our API endpoint instead of direct Supabase query
      const response = await fetch('/api/admin/profile');
      const data = await response.json();

      if (response.ok && data) {
        setProfile(data);
      } else {
        // Fallback to basic user info
        setProfile({
          id: user.id,
          email: user.email,
          first_name: '',
          last_name: '',
          phone_number: '',
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="p-4 border-t border-gray-700 mt-auto">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-600"></div>
            <div className="h-4 w-24 bg-gray-600 rounded mt-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.email?.split('@')[0] || 'User';

  return (
    <div className="p-4 border-t border-gray-700 mt-auto">
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <Link href="/profile" className="block hover:opacity-80">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
              {profile.phone_number && (
                <p className="text-xs text-gray-400 truncate">{profile.phone_number}</p>
              )}
            </Link>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Signed in as <span className="text-blue-400">{profile.role || 'user'}</span>
          </p>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full text-xs text-red-400 hover:text-red-300 text-left"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
