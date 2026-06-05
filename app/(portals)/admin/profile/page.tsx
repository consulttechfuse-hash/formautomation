'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get profile from public.users table
    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name, email, phone_number, bio')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
    } else if (data) {
      setProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || user.email || '',
        phone_number: data.phone_number || '',
        bio: data.bio || '',
      });
    } else {
      setProfile({
        first_name: '',
        last_name: '',
        email: user.email || '',
        phone_number: '',
        bio: '',
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMessage('User not found');
      setUpdating(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={profile.email}
            className="w-full border rounded-lg px-4 py-2 bg-gray-100"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={profile.phone_number}
            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="+27 XX XXX XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
