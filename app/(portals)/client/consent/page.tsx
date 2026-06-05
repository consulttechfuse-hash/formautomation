"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function ConsentPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    id_number: '',
  });
  const [consented, setConsented] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user data from user_roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('first_name, last_name, phone_number, email, address, id_number')
        .eq('user_id', user.id)
        .single();

      if (userRole) {
        setUserData({
          email: userRole.email || user.email || '',
          first_name: userRole.first_name || '',
          last_name: userRole.last_name || '',
          phone_number: userRole.phone_number || '',
          address: userRole.address || '',
          id_number: userRole.id_number || '',
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consented) {
      setError('You must consent to continue');
      return;
    }

    if (!userData.address.trim()) {
      setError('Please enter your address');
      return;
    }

    if (!userData.id_number.trim()) {
      setError('Please enter your ID/Passport number');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Session expired');
        setSaving(false);
        return;
      }

      // Save address and ID to user_roles
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          address: userData.address,
          id_number: userData.id_number,
          consent_given: true,
          consent_given_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        setError('Failed to save your information');
        setSaving(false);
        return;
      }

      // Also update users table
      await supabase
        .from('users')
        .update({
          address: userData.address,
          id_number: userData.id_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Save consent record
      await supabase
        .from('consents')
        .insert({
          user_id: user.id,
          admin_id: null,
          html_content: 'Consent given for DocControl services',
          html_content_version: '1.0',
          ip_address: '',
          cont_key: 'doccontrol_consent',
          title: 'DocControl Service Consent',
          created_at: new Date().toISOString(),
        });

      // Redirect to select admin page
      router.push('/client/select-admin');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Consent & Additional Information</h1>
          <p className="text-gray-600 text-center mb-6">
            Please provide your consent and complete the information below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only user info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold mb-3">Your Information</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Name:</span> {userData.first_name} {userData.last_name}</div>
                <div><span className="text-gray-500">Email:</span> {userData.email}</div>
                <div><span className="text-gray-500">Phone:</span> {userData.phone_number}</div>
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Residential / Postal Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={userData.address}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Street address, city, postal code"
                required
                disabled={saving}
              />
            </div>

            {/* ID/Passport Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID / Passport Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userData.id_number}
                onChange={(e) => setUserData({ ...userData, id_number: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your ID or Passport number"
                required
                disabled={saving}
              />
            </div>

            {/* Consent Checkbox */}
            <div className="border-t pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600"
                  disabled={saving}
                />
                <span className="text-gray-700">
                  I hereby consent to the collection and processing of my personal information 
                  for the purpose of providing DocControl services. I confirm that the information 
                  provided is true and correct.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !consented}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {saving ? 'Saving...' : 'Continue to Admin Selection'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
