'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SelectAdminPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, email, first_name, last_name')
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
    setErrorMsg(null);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    console.log('=== Starting admin selection for user:', user.id);
    console.log('Selected admin ID:', selectedAdminId);

    // 1. Update user_roles table with assigned_admin_id
    const { error: roleError, data: roleData } = await supabase
      .from('user_roles')
      .update({ assigned_admin_id: selectedAdminId })
      .eq('user_id', user.id)
      .select();

    if (roleError) {
      console.error('Error updating user_roles:', roleError);
      setErrorMsg(`Role update failed: ${roleError.message}`);
    } else {
      console.log('User roles updated successfully:', roleData);
    }

    // 2. Update client_flow_state
    const { data: existingFlow, error: fetchError } = await supabase
      .from('client_flow_state')
      .select('id, step_1_admin_selected, current_step')
      .eq('client_id', user.id)
      .single();

    console.log('Existing flow state:', existingFlow);
    if (fetchError) {
      console.log('Fetch error (may not exist):', fetchError);
    }

    let flowResult;
    if (existingFlow) {
      console.log('Updating existing flow state...');
      flowResult = await supabase
        .from('client_flow_state')
        .update({
          step_1_admin_selected: true,
          current_step: 2,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', user.id)
        .select();
      
      if (flowResult.error) {
        console.error('Error updating flow state:', flowResult.error);
        setErrorMsg(`Flow update failed: ${flowResult.error.message}`);
      } else {
        console.log('Flow state updated successfully:', flowResult.data);
      }
    } else {
      console.log('Creating new flow state...');
      flowResult = await supabase
        .from('client_flow_state')
        .insert({
          client_id: user.id,
          step_1_admin_selected: true,
          current_step: 2,
          lock_type: 'unlocked',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (flowResult.error) {
        console.error('Error inserting flow state:', flowResult.error);
        setErrorMsg(`Flow insert failed: ${flowResult.error.message}`);
      } else {
        console.log('Flow state created successfully:', flowResult.data);
      }
    }

    // 3. Verify the update
    const { data: verifyFlow } = await supabase
      .from('client_flow_state')
      .select('step_1_admin_selected, current_step')
      .eq('client_id', user.id)
      .single();
    
    console.log('VERIFICATION - After update:', verifyFlow);

    // 4. Trigger round-robin agent assignment
    try {
      const response = await fetch('/api/agent/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: user.id, adminId: selectedAdminId })
      });
      const result = await response.json();
      console.log('Agent assignment result:', result);
    } catch (error) {
      console.error('Round robin assignment error:', error);
    }

    setSaving(false);
    
    if (errorMsg) {
      alert(`Error: ${errorMsg}. Check console for details.`);
    } else {
      router.push('/client/select-payment');
    }
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
      
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}
      
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
                  {admin.first_name} {admin.last_name} ({admin.email})
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
