'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Eye, Clock, Flag, User, RefreshCw } from 'lucide-react';

interface Request {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string;
  request_type: 'change_admin' | 'unlock_form01';
  new_admin_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  is_fraud_case: boolean;
  investigation_status: string;
  requested_at: string;
  admin_notes?: string;
  new_admin?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface Admin {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function RequestManagement() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'fraud'>('pending');
  const supabase = createClient();

  useEffect(() => {
    loadRequests();
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, email, first_name, last_name')
      .eq('role', 'admin');
    
    if (data) {
      setAdmins(data);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get admin ID
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    const adminId = adminRole?.user_id || user.id;

    // Get all requests for clients under this admin
    const { data: clientsUnderAdmin } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'client')
      .eq('assigned_admin_id', adminId);

    const clientIds = clientsUnderAdmin?.map(c => c.user_id) || [];

    if (clientIds.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data: requestsData } = await supabase
      .from('unlock_requests')
      .select(`
        *,
        new_admin:new_admin_id (email, first_name, last_name)
      `)
      .in('client_id', clientIds)
      .order('requested_at', { ascending: false });

    if (requestsData) {
      setRequests(requestsData as Request[]);
    }
    
    setLoading(false);
  };

  const handleApprove = async (request: Request) => {
    setProcessingId(request.id);
    
    const { data: { user } } = await supabase.auth.getUser();
    const sastTimestamp = new Date().toISOString();

    // Update request status
    await supabase
      .from('unlock_requests')
      .update({
        status: 'approved',
        reviewed_by_admin_id: user?.id,
        reviewed_at: sastTimestamp
      })
      .eq('id', request.id);

    if (request.request_type === 'change_admin' && request.new_admin_id) {
      // Update client's assigned admin
      await supabase
        .from('user_roles')
        .update({ 
          assigned_admin_id: request.new_admin_id,
          updated_at: sastTimestamp
        })
        .eq('user_id', request.client_id);
      
      // Re-run round-robin agent assignment for new admin
      await fetch('/api/agent/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: request.client_id, 
          adminId: request.new_admin_id 
        })
      });
    } else if (request.request_type === 'unlock_form01') {
      // Unlock Form-01 for client
      await supabase
        .from('client_flow_state')
        .update({
          lock_type: 'overridden',
          locked_step: null,
          locked_reason: null,
          overridden_by: user?.id,
          override_reason: `Admin approved unlock request: ${request.reason}`,
          overridden_at: sastTimestamp
        })
        .eq('client_id', request.client_id);
    }

    // Log to audit
    await supabase
      .from('request_audit_log')
      .insert({
        request_id: request.id,
        action: 'approved',
        performed_by: user?.id,
        performed_by_role: 'admin',
        details: { request_type: request.request_type }
      });

    await loadRequests();
    setProcessingId(null);
  };

  const handleDecline = async (request: Request) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    setProcessingId(request.id);
    
    const { data: { user } } = await supabase.auth.getUser();
    const sastTimestamp = new Date().toISOString();

    await supabase
      .from('unlock_requests')
      .update({
        status: 'rejected',
        reviewed_by_admin_id: user?.id,
        reviewed_at: sastTimestamp,
        admin_notes: rejectionReason
      })
      .eq('id', request.id);

    await supabase
      .from('request_audit_log')
      .insert({
        request_id: request.id,
        action: 'declined',
        performed_by: user?.id,
        performed_by_role: 'admin',
        details: { reason: rejectionReason }
      });

    setShowRejectModal(false);
    setRejectionReason('');
    await loadRequests();
    setProcessingId(null);
  };

  const getStatusBadge = (request: Request) => {
    if (request.is_fraud_case) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"><Flag className="h-3 w-3" /> Fraud Alert</span>;
    }
    switch (request.status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'fraud') return r.is_fraud_case;
    return r.status === filter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Client Requests</h2>
          <p className="text-sm text-gray-500">Review and manage client requests</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilter('fraud')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'fraud' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
          >
            Fraud ({requests.filter(r => r.is_fraud_case).length})
          </button>
          <button 
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
          >
            Rejected
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          <button 
            onClick={loadRequests}
            className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Fraud Alert Summary */}
      {requests.filter(r => r.is_fraud_case && r.status === 'pending').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Fraud Alerts</h3>
          </div>
          <p className="text-sm text-red-700">
            {requests.filter(r => r.is_fraud_case && r.status === 'pending').length} client(s) have exceeded request limits. 
            Please review these cases carefully.
          </p>
        </div>
      )}

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No {filter !== 'all' ? filter : ''} requests found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Request Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requested</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className={`hover:bg-gray-50 ${request.is_fraud_case ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{request.client_name}</div>
                      <div className="text-xs text-gray-500">{request.client_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.request_type === 'change_admin' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {request.request_type === 'change_admin' ? '🔄 Change Admin' : '🔓 Unlock Form-01'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {request.request_type === 'change_admin' && request.new_admin && (
                        <div className="text-sm">
                          <span className="text-gray-500">New Admin:</span>{' '}
                          {request.new_admin.first_name} {request.new_admin.last_name} ({request.new_admin.email})
                        </div>
                      )}
                      <div className="text-sm mt-1">
                        <span className="text-gray-500">Reason:</span>{' '}
                        <span className="line-clamp-2">{request.reason}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(request.requested_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(request)}
                    </td>
                    <td className="px-4 py-3">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            disabled={processingId === request.id}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Decline
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Declining request from <strong>{selectedRequest.client_name}</strong> for {selectedRequest.request_type === 'change_admin' ? 'admin change' : 'Form-01 unlock'}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for declining</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why this request is being declined..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecline(selectedRequest)}
                disabled={processingId === selectedRequest.id || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === selectedRequest.id ? 'Processing...' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRequest && !showRejectModal && selectedRequest.status !== 'pending' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Client:</span>
                <p className="font-medium">{selectedRequest.client_name}</p>
                <p className="text-sm text-gray-600">{selectedRequest.client_email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Type:</span>
                <p>{selectedRequest.request_type === 'change_admin' ? 'Change Admin' : 'Unlock Form-01'}</p>
              </div>
              {selectedRequest.request_type === 'change_admin' && selectedRequest.new_admin && (
                <div>
                  <span className="text-sm text-gray-500">Requested New Admin:</span>
                  <p>{selectedRequest.new_admin.first_name} {selectedRequest.new_admin.last_name} ({selectedRequest.new_admin.email})</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">Reason:</span>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedRequest.reason}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <p className="capitalize">{selectedRequest.status}</p>
              </div>
              {selectedRequest.admin_notes && (
                <div>
                  <span className="text-sm text-gray-500">Admin Notes:</span>
                  <p className="text-sm bg-red-50 p-2 rounded text-red-700">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
