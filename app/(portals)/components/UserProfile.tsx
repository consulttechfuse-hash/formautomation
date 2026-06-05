'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, Mail, Phone, LogOut, ChevronRight } from 'lucide-react';

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

      const response = await fetch('/api/admin/profile');
      const data = await response.json();

      if (response.ok && data) {
        setProfile(data);
      } else {
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
      <div className="p-5 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const fullName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.email?.split('@')[0] || 'User';
  
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-5 border-t border-gray-200 dark:border-gray-700">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {initials}
          </div>
          <div className="flex-1">
            <Link href="/profile" className="hover:opacity-80 transition-opacity">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {fullName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {profile.role === 'admin' ? 'Administrator' : profile.role || 'User'}
                <ChevronRight className="w-3 h-3" />
              </p>
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Mail className="w-4 h-4 text-blue-500" />
            <span className="truncate">{profile.email}</span>
          </div>
          {profile.phone_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 text-green-500" />
              <span>{profile.phone_number}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

        {/* Actions */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
