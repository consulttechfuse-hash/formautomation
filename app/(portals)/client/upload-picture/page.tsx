'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function UploadPicturePage() {
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUserId(session.user.id);
      
      // Get existing photo from USERS table (not profiles)
      const { data } = await supabase
        .from('users')
        .select('profile_photo_url')
        .eq('id', session.user.id)
        .single();
      
      if (data?.profile_photo_url) {
        setPhotoUrl(data.profile_photo_url);
      }
      
      setIsLoading(false);
    }
    
    load();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !userId) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(filePath);

      // Update USERS table
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPhotoUrl(publicUrl);
      setMessage('✅ Upload successful!');
      
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    router.push('/forms/01');
  };

  if (isLoading) {
    return <div className="text-center p-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Upload Your Picture</h1>
        
        {!photoUrl ? (
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/jpeg,image/png"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full"
          />
        ) : (
          <div className="text-center">
            <img src={photoUrl} alt="Profile" className="w-32 h-32 mx-auto border rounded-lg" />
            <button onClick={handleContinue} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              Continue
            </button>
          </div>
        )}
        
        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
}
