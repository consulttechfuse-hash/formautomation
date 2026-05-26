'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PhotoPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      alert('Photo uploaded successfully!');
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Upload Photo</h1>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="mb-4"
        />
        
        {previewUrl && (
          <div className="mb-4">
            <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>
    </div>
  );
}
