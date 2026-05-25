'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PhotoUpload from '@/components/client/PhotoUpload';

export default function UploadPhotoPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoComplete, setPhotoComplete] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data } = await supabase
        .from('users')
        .select('profile_photo_url, onboarding_complete')
        .eq('id', user.id)
        .single();
      
      if (data?.profile_photo_url) {
        setPhotoComplete(true);
      }
      
      if (data?.onboarding_complete) {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  const handlePhotoComplete = async (photoUrl: string) => {
    setPhotoComplete(true);
    setTimeout(() => {
      router.push('/forms/01');
    }, 2000);
  };

  if (loading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  if (!userId) {
    return <div className="text-center p-12">Please sign in to continue</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Step 7 of 8</div>
            <div className="text-sm text-green-600">Upload Your Picture</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <PhotoUpload userId={userId} onUploadComplete={handlePhotoComplete} />

        {photoComplete && (
          <div className="mt-6 text-center text-green-600">
            ✓ Photo uploaded successfully! Redirecting to Form-01...
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>This photo will be embedded in Form-06 and Form-07</p>
          <p className="mt-1">Contact support@techfuseconsulting.online for assistance</p>
        </div>
      </div>
    </div>
  );
}
