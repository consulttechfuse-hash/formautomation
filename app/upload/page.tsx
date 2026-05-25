'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UploadPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('users')
          .select('profile_photo_url')
          .eq('id', user.id)
          .single();
        if (data?.profile_photo_url) {
          setPhotoUrl(data.profile_photo_url);
        }
      }
    };
    getUser();
  }, [supabase]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPhotoUrl(publicUrl);
      setMessage('✅ Upload successful!');
    } catch (err: any) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Upload Passport Picture</h1>
        <p className="text-gray-600 mb-4">This photo will appear in Form-06 and Form-07</p>
        
        {photoUrl ? (
          <div className="text-center">
            <img src={photoUrl} alt="Profile" className="w-32 h-32 mx-auto border rounded-lg object-cover" />
            <p className="text-green-600 mt-2">✓ Photo uploaded</p>
            <button 
              onClick={() => setPhotoUrl(null)}
              className="mt-2 text-red-500 text-sm"
            >
              Upload New Photo
            </button>
          </div>
        ) : (
          <div>
            <input 
              type="file" 
              accept="image/jpeg,image/png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        {message && (
          <div className={`mt-4 p-2 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
