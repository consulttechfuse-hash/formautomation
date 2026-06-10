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
      } else {
        setUserData(prev => ({ ...prev, email: user.email || '' }));
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
        setError(updateError.message);
        setSaving(false);
        return;
      }

      await supabase
        .from('client_flow_state')
        .update({
          step_3_consent_completed: true,
          current_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', user.id);

      router.push('/client/form-01');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Consent & Additional Information</h1>
            <p className="text-blue-100 mt-1">Please review and complete the information below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Display user info (read-only) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{userData.first_name} {userData.last_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{userData.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">{userData.phone_number}</span>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Residential / Postal Address *</h2>
              <textarea
                value={userData.address}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Street address, city, postal code"
                required
              />
            </div>

            {/* ID Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">ID / Passport Number *</h2>
              <input
                type="text"
                value={userData.id_number}
                onChange={(e) => setUserData({ ...userData, id_number: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your ID or Passport number"
                required
              />
            </div>

            {/* Consent Checkbox */}
            <div className="border-t pt-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  I hereby consent to the collection and processing of my personal information for the purpose of providing DocControl services. 
                  I confirm that the information provided is true and correct.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Continue to Form-01 →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
