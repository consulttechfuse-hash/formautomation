'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: 'change_admin' | 'unlock_form01' | null;
  onSuccess: () => void;
}

interface Admin {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function RequestModal({ isOpen, onClose, requestType, onSuccess }: RequestModalProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && requestType === 'change_admin') {
      loadCurrentAdminAndAdmins();
    }
  }, [isOpen, requestType]);

  const loadCurrentAdminAndAdmins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current client's assigned admin
    const { data: client } = await supabase
      .from('user_roles')
      .select('assigned_admin_id')
      .eq('user_id', user.id)
      .single();

    setCurrentAdminId(client?.assigned_admin_id || null);

    // Get all admins (excluding current admin)
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, email, first_name, last_name')
      .eq('role', 'admin');

    if (!error && data) {
      // Filter out current admin
      const filteredAdmins = data.filter(admin => admin.user_id !== client?.assigned_admin_id);
      setAdmins(filteredAdmins);
    }
  };

  const handleSubmit = async () => {
    if (requestType === 'change_admin' && !selectedAdminId) {
      setError('Please select a new admin');
      return;
    }
    
    // Check if trying to select the same admin
    if (requestType === 'change_admin' && selectedAdminId === currentAdminId) {
      setError('You are already assigned to this admin. Please select a different admin.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }

    setLoading(true);
    setError('');

    const response = await fetch('/api/client/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType,
        newAdminId: selectedAdminId,
        reason: reason.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to submit request');
      setLoading(false);
      return;
    }

    if (data.isFraud) {
      setError('⚠️ FRAUD ALERT: Your request has been flagged for review. Our security team will investigate.');
    } else {
      setError('');
    }

    setRemainingRequests(data.remainingRequests);
    
    setTimeout(() => {
      onSuccess();
      onClose();
      setReason('');
      setSelectedAdminId('');
      setRemainingRequests(null);
    }, 2000);
  };

  if (!isOpen || !requestType) return null;

  const isChangeAdmin = requestType === 'change_admin';
  const title = isChangeAdmin ? 'Change Admin' : 'Unlock Form-01';
  const description = isChangeAdmin 
    ? 'Request to change your assigned admin. You can only do this once.'
    : 'Request to unlock Form-01 for editing. You can only do this once.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">{description}</p>
          
          {isChangeAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select New Admin <span className="text-red-500">*</span>
              </label>
              {admins.length === 0 ? (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  No other admins available. Please contact support.
                </p>
              ) : (
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">-- Select a new admin --</option>
                  {admins.map((admin) => (
                    <option key={admin.user_id} value={admin.user_id}>
                      {admin.first_name} {admin.last_name} ({admin.email})
                    </option>
                  ))}
                </select>
              )}
              {currentAdminId && (
                <p className="text-xs text-gray-400 mt-1">
                  Your current admin is not shown. Select a different admin to request change.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for request <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder={isChangeAdmin 
                ? "Explain why you need to change your admin..." 
                : "Explain why you need to edit Form-01..."}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 10 characters</p>
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${error.includes('FRAUD') ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
          )}

          {remainingRequests !== null && remainingRequests >= 0 && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              ✅ Request submitted successfully! {remainingRequests} request(s) remaining.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (isChangeAdmin && admins.length === 0)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
