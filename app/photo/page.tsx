'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function PhotoUpload() {
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [status, setStatus] = useState('');
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('users').select('profile_photo_url').eq('id', user.id).single();
        if (data?.profile_photo_url) setPhotoUrl(data.profile_photo_url);
      }
    }
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setStatus('Uploading...');
    
    const ext = file.name.split('.').pop();
    const path = `profile-photos/${userId}-${Date.now()}.${ext}`;
    
    const { error: uploadErr } = await supabase.storage.from('client-assets').upload(path, file);
    if (uploadErr) {
      setStatus('Error: ' + uploadErr.message);
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(path);
    await supabase.from('users').update({ profile_photo_url: publicUrl }).eq('id', userId);
    
    setPhotoUrl(publicUrl);
    setStatus('✅ Upload complete!');
    setUploading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Upload Passport Picture</h2>
      <p>This photo will appear in Form-06 and Form-07</p>
      
      {photoUrl ? (
        <div>
          <img src={photoUrl} style={{ width: '150px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <p style={{ color: 'green' }}>✓ Photo uploaded successfully</p>
          <button onClick={() => window.location.reload()}>Upload New Photo</button>
        </div>
      ) : (
        <div>
          <input 
            type="file" 
            accept="image/jpeg,image/png" 
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'block', margin: '20px 0', padding: '10px' }}
          />
          <p style={{ fontSize: '12px', color: '#666' }}>Accepted: JPG, PNG (Max 5MB)</p>
        </div>
      )}
      
      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: status.includes('✅') ? '#d4edda' : '#f8d7da',
          color: status.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
      
      <div style={{ marginTop: '30px', fontSize: '12px' }}>
        <a href="/forms/06">View Form-06 →</a> | <a href="/forms/07">View Form-07 →</a>
      </div>
    </div>
  );
}
