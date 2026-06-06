'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SelectAdminPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch all users with role 'admin' from user_roles
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, email')
      .eq('role', 'admin');

    if (error) {
      console.error('Error loading admins:', error);
    }

    setAdmins(data || []);
    setLoading(false);
  }

  async function handleSelectAdmin() {
    if (!selectedAdminId) {
      alert('Please select an admin');
      return;
    }

    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // 1. Update user_roles table (assigned_admin_id)
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ assigned_admin_id: selectedAdminId })
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error updating user_roles:', roleError);
    }

    // 2. Update client_flow_state
    const { data: existingFlow } = await supabase
      .from('client_flow_state')
      .select('id')
      .eq('client_id', user.id)
      .single();

    if (existingFlow) {
      await supabase
        .from('client_flow_state')
        .update({
          step_1_admin_selected: true,
          current_step: 2,
          step_1_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('client_id', user.id);
    } else {
      await supabase
        .from('client_flow_state')
        .insert({
          client_id: user.id,
          step_1_admin_selected: true,
          current_step: 2,
          step_1_completed_at: new Date().toISOString(),
          lock_type: 'unlocked',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    setSaving(false);
    router.push('/client/select-payment');
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Choose Your National Admin</h1>
      
      <div className="border rounded-lg p-6 bg-gray-50 mb-6">
        <p className="text-gray-600 mb-4">Please select an admin who will oversee your case:</p>
        
        {admins.length === 0 ? (
          <p className="text-yellow-600">No admins available. Please contact support.</p>
        ) : (
          <div className="mb-4">
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="">-- Select an Admin --</option>
              {admins.map((admin) => (
                <option key={admin.user_id} value={admin.user_id}>
                  {admin.email}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/client/dashboard')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handleSelectAdmin}
          disabled={saving || !selectedAdminId}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Continue to Payment →'}
        </button>
      </div>
    </div>
  );
}
