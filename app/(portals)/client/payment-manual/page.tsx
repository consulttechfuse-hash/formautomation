'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ManualPaymentPage() {
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popFile, setPopFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Ensure user exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Insert into users table if not exists
      await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          role: 'client',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
    }

    // Ensure user exists in user_roles table
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingRole) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          email: user.email,
          role: 'client',
          has_consented: false,
          onboarding_complete: false,
          onboarding_submitted: false,
          has_paid: false,
          created_at: new Date().toISOString(),
        });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('has_paid, idp_t1')
      .eq('id', user.id)
      .single();

    if (userData?.has_paid === true) {
      router.push('/client/form-01');
      return;
    }

    const idPassport = userData?.idp_t1 || user.id.slice(0, 8);
    setReference(idPassport);
    setUser(user);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.type.includes('image')) {
        setError('Please upload a PDF or image file (PNG, JPG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Max size 5MB.');
        return;
      }
      setPopFile(file);
      setError('');
    }
  };

  const uploadPOP = async () => {
    if (!popFile) return false;

    setUploading(true);
    const fileExt = popFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('pops')
      .upload(fileName, popFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return false;
    }

    setUploading(false);
    return fileName;
  };

  const handleSubmit = async () => {
    if (!popFile) {
      setError('Please upload your proof of payment');
      return;
    }

    setSubmitting(true);
    setError('');

    const popPath = await uploadPOP();
    if (!popPath) {
      setSubmitting(false);
      return;
    }

    // First, ensure the user exists in the referenced table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          role: 'client',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
    }

    const { error: insertError } = await supabase
      .from('manual_payment_requests')
      .insert({
        client_id: user.id,
        client_email: user.email,
        client_name: user.email,
        reference: reference,
        pop_url: popPath,
        pop_filename: popFile.name,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      setError(`Database error: ${insertError.message}`);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Payment Request Submitted!</h1>
          <p className="text-gray-600 mb-4">
            Your proof of payment has been received. Verification takes up to 48 hours.
          </p>
        </div>
        <button
          onClick={() => router.push('/client/dashboard')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Manual EFT Payment</h1>
      <p className="text-gray-600 mb-6">Pay via bank transfer and upload proof</p>

      <div className="bg-gray-50 border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Bank:</span>
            <span className="font-medium">Capitrek Bank</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-medium">Techfuse Holdings (Pty) Ltd</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Number:</span>
            <span className="font-medium">0000125478</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-green-600">R400.00</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Reference:</span>
            <span className="font-mono font-medium">{reference}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Proof of Payment</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="pop-upload"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pop-upload" className="cursor-pointer">
            <span className="text-4xl mb-2 block">📎</span>
            <span className="text-blue-600">{popFile ? popFile.name : 'Click to upload POP'}</span>
          </label>
        </div>

        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/client/select-payment')}
          className="px-6 py-2 border rounded-lg"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !popFile}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Payment Request'}
        </button>
      </div>
    </div>
  );
}
