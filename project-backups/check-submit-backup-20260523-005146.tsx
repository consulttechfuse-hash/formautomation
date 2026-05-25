'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import JumpButton from '@/components/JumpButton';

export default function FormCheckSubmit() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [form01Data, setForm01Data] = useState<any>(null);
  const [consentHtml, setConsentHtml] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
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
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Store the correct user ID
    setUserId(session.user.id);
    
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_submitted, submitted_at')
      .eq('id', session.user.id)
      .single();
    
    if (userData?.onboarding_submitted === true) {
      setIsSubmitted(true);
      setSubmittedAt(userData?.submitted_at);
      
      if (userData?.submitted_at) {
        const submitted = new Date(userData.submitted_at);
        const now = new Date();
        const expiryDate = new Date(submitted);
        expiryDate.setDate(expiryDate.getDate() + 7);
        const remaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(remaining);
        setIsExpired(remaining < 0);
      }
    }
    
    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setForm01Data(form01 || {});
    
    const { data: consentData } = await supabase
      .from('consents')
      .select('html_content')
      .eq('cont_key', 'consent')
      .single();
    
    if (consentData?.html_content) {
      let rendered = consentData.html_content;
      if (form01) {
        Object.keys(form01).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          const value = form01[key] || '';
          rendered = rendered.replace(regex, value);
        });
      }
      setConsentHtml(rendered);
    }
    
    setLoading(false);
  }

  async function logDownload(formNumber: number) {
    if (!userId) return;
    
    await supabase.from('download_logs').insert({
      user_id: userId,
      user_email: form01Data?.ema_t1 || '',
      form_number: formNumber,
      download_type: 'docx',
      ip_address: 'client-side',
      downloaded_at: new Date().toISOString()
    });
  }

  async function downloadDOCX(formNumber: number) {
    if (isExpired) {
      alert('Your forms have expired (7 days passed). Please contact support.');
      return;
    }
    
    if (!userId) {
      alert('User not found. Please refresh and try again.');
      return;
    }
    
    await logDownload(formNumber);
    
    // Call the API route with the correct user ID
    window.location.href = `/api/forms/download-docx?form=${formNumber}&userId=${userId}`;
  }

  async function downloadAllDOCX() {
    if (isExpired) {
      alert('Your forms have expired (7 days passed). Please contact support.');
      return;
    }
    
    if (!userId) {
      alert('User not found. Please refresh and try again.');
      return;
    }
    
    await logDownload(0);
    
    window.location.href = `/api/forms/download-docx?all=true&userId=${userId}`;
  }

  async function uploadIDPassport() {
    if (!uploadedFile) return null;
    if (!userId) return null;
    const fileExt = uploadedFile.name.split('.').pop();
    const fileName = `${form01Data?.idp_t1 || form01Data?.fn_t1 || 'user'}-${Date.now()}.${fileExt}`;
    const filePath = `id-documents/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, uploadedFile);
    if (uploadError) return null;
    const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
    setUploadSuccess(true);
    return publicUrl;
  }

  async function handleSubmit() {
    if (isSubmitted) {
      alert('You have already submitted your forms.');
      return;
    }
    setShowConfirmDialog(true);
  }

  async function confirmSubmit() {
    setShowConfirmDialog(false);
    setSubmitting(true);
    if (!userId) return;
    
    const idUrl = uploadedFile ? await uploadIDPassport() : null;
    
    await supabase.from('users').update({ 
      onboarding_complete: true,
      onboarding_submitted: true,
      onboarding_locked: true,
      submitted_at: new Date().toISOString(),
      last_completed_form: 17,
      id_document_url: idUrl
    }).eq('id', userId);
    
    setSubmitting(false);
    setIsSubmitted(true);
    setSubmittedAt(new Date().toISOString());
    setSuccessMessage('✓ All forms successfully submitted and locked! You have 7 days to download your documents.');
    
    setTimeout(() => setSuccessMessage(''), 8000);
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
        
        {isSubmitted && (
          <div className={`rounded p-4 mb-6 ${isExpired ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700'}`}>
            <p className="font-semibold">
              {isExpired 
                ? '⚠️ Your forms have expired (7 days passed). Please contact support for assistance.'
                : `✓ Forms submitted on ${new Date(submittedAt!).toLocaleDateString()}. Download available for ${daysRemaining} more days.`
              }
            </p>
          </div>
        )}
        
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
            
            {!isSubmitted ? (
              <>
                <label className="flex items-center gap-3 mb-4">
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="w-5 h-5" />
                  <span>I confirm all information is correct</span>
                </label>
                
                <div className="mb-4">
                  <label className="block font-medium mb-2">Upload ID/Passport (Optional)</label>
                  <input type="file" accept="image/jpeg,image/png" onChange={(e) => setUploadedFile(e.target.files?.[0] || null)} className="w-full border rounded p-2" />
                  {uploadSuccess && <p className="text-green-600 text-sm mt-1">Uploaded</p>}
                </div>
                
                <button onClick={handleSubmit} disabled={!confirmed || submitting || isSubmitted} className="w-full bg-green-600 text-white py-3 rounded disabled:opacity-50">
                  {submitting ? 'Submitting...' : (isSubmitted ? 'Already Submitted' : 'Submit All Forms')}
                </button>
              </>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-green-700 font-semibold">✓ Forms Submitted</p>
                <p className="text-sm text-gray-600 mt-2">Submitted on: {new Date(submittedAt!).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Download Options</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Bulk Download</h3>
              <button onClick={downloadAllDOCX} disabled={isExpired} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full">
                Download All Forms (DOCX)
              </button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Individual Forms</h3>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n => (
                  <div key={n} className="border rounded p-2 text-center">
                    <div className="text-sm font-medium">Form {n}</div>
                    <button onClick={() => downloadDOCX(n)} disabled={isExpired} className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1 w-full disabled:opacity-50">
                      DOCX
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {consentHtml && (
          <div className="bg-white rounded shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Consent Form (Preview)</h2>
            <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: consentHtml }} />
            </div>
          </div>
        )}
      </div>
      
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Submission</h3>
            <p className="mb-6">Are you sure? Once submitted, forms will be locked and you cannot make further changes.</p>
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
