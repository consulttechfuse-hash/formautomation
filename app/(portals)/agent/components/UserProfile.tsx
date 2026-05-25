'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('fn_t1, srn_t1, email, cnt_1, role')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  if (!profile) return null;

  const displayName = profile.fn_t1 && profile.srn_t1 
    ? `${profile.fn_t1} ${profile.srn_t1}` 
    : profile.email.split('@')[0];

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            {profile.cnt_1 && (
              <p className="text-xs text-gray-500 truncate">{profile.cnt_1}</p>
            )}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Signed in as <span className="text-blue-600">{profile.role || 'user'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
