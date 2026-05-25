'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import JumpButton from '@/components/JumpButton';

export default function FormCheckSubmit() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [form01Data, setForm01Data] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setForm01Data(form01 || {});
    setLoading(false);
  }

  async function downloadAsZIP() {
    alert('ZIP download - will download all forms');
  }

  async function downloadAllAsPDF() {
    alert('PDF download - will download all forms as PDF');
  }

  async function downloadAllAsDOCX() {
    alert('DOCX download - will download all forms as DOCX');
  }

  async function downloadSinglePDF(formNum: number) {
    alert(`Downloading Form ${formNum} as PDF`);
  }

  async function downloadSingleDOCX(formNum: number) {
    alert(`Downloading Form ${formNum} as DOCX`);
  }

  async function handleSubmit() {
    setShowConfirmDialog(true);
  }

  async function confirmSubmit() {
    setShowConfirmDialog(false);
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    if (uploadedFile) {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${form01Data?.fn_t1 || 'user'}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('client-assets').upload(`id-documents/${fileName}`, uploadedFile);
      setUploadSuccess(true);
    }
    
    await supabase.from('users').update({ 
      onboarding_complete: true, 
      onboarding_submitted: true 
    }).eq('id', session.user.id);
    
    setSubmitting(false);
    setSuccessMessage('✓ All forms successfully saved!');
    setTimeout(() => setSuccessMessage(''), 5000);
  }

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="w-24"></div>
            <JumpButton />
            <div className="w-24"></div>
          </div>
          <h1 className="text-2xl font-bold text-center mt-4">Form Check & Submit</h1>
        </div>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-6">{successMessage}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Confirm Your Information</h2>
            <div className="p-3 bg-gray-50 rounded mb-4">
              <p><strong>First Name:</strong> {form01Data?.fn_t1 || '-'}</p>
              <p><strong>Surname:</strong> {form01Data?.srn_t1 || '-'}</p>
              <p><strong>ID/Passport:</strong> {form01Data?.idp_t1 || '-'}</p>
              <p><strong>Email:</strong> {form01Data?.ema_t1 || '-'}</p>
            </div>
            
            <label className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="w-5 h-5" />
              <span>I confirm all information is correct</span>
            </label>
            
            <div className="mb-4">
              <label className="block font-medium mb-2">Upload ID/Passport</label>
              <input type="file" accept="image/jpeg,image/png" onChange={(e) => setUploadedFile(e.target.files?.[0] || null)} className="w-full border rounded p-2" />
              {uploadSuccess && <p className="text-green-600 text-sm mt-1">✓ Uploaded</p>}
            </div>
            
            <button onClick={handleSubmit} disabled={!confirmed || submitting} className="w-full bg-green-600 text-white py-3 rounded">
              {submitting ? 'Submitting...' : '✓ Submit All Forms'}
            </button>
          </div>
          
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Download Options</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Bulk Download (All Forms 02-17)</h3>
              <div className="flex gap-2">
                <button onClick={downloadAsZIP} className="bg-blue-600 text-white px-4 py-2 rounded">ZIP</button>
                <button onClick={downloadAllAsPDF} className="bg-blue-600 text-white px-4 py-2 rounded">PDF</button>
                <button onClick={downloadAllAsDOCX} className="bg-blue-600 text-white px-4 py-2 rounded">DOCX</button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Individual Forms</h3>
              <div className="grid grid-cols-4 gap-2">
                {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n => (
                  <div key={n} className="border rounded p-2 text-center">
                    <div className="text-sm font-medium">Form {n}</div>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => downloadSinglePDF(n)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">PDF</button>
                      <button onClick={() => downloadSingleDOCX(n)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">DOCX</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Submission</h3>
            <p className="mb-6">Are you sure? You cannot edit after submission.</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowConfirmDialog(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={confirmSubmit} className="px-4 py-2 bg-green-600 text-white rounded">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
