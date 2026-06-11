'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Eye, Clock, Flag, RefreshCw, Search } from 'lucide-react';

interface Request {
  id: string;
  client_id: string;
  client_email?: string;
  client_name?: string;
  request_type: 'change_admin' | 'unlock_form01';
  new_admin_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  is_fraud_case: boolean;
  investigation_status: string;
  created_at: string;
  reviewed_at: string;
  admin_notes?: string;
  reviewed_by_admin_id?: string;
  new_admin?: {
    email: string;
    first_name: string;
    last_name: string;
  };
  client?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function RequestManagement() {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'fraud'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadAllRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allRequests, filter, searchTerm]);

  const loadAllRequests = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: requestsData } = await supabase
      .from('unlock_requests')
      .select(`
        *,
        new_admin:new_admin_id (email, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (requestsData) {
      const enrichedRequests = await Promise.all(requestsData.map(async (req) => {
        const { data: client } = await supabase
          .from('user_roles')
          .select('email, first_name, last_name')
          .eq('user_id', req.client_id)
          .single();
        
        return {
          ...req,
          client_email: client?.email,
          client_name: `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || client?.email,
          client
        };
      }));
      setAllRequests(enrichedRequests);
    }
    
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allRequests];
    
    if (filter === 'pending') {
      filtered = filtered.filter(r => r.status === 'pending');
    } else if (filter === 'approved') {
      filtered = filtered.filter(r => r.status === 'approved');
    } else if (filter === 'rejected') {
      filtered = filtered.filter(r => r.status === 'rejected');
    } else if (filter === 'fraud') {
      filtered = filtered.filter(r => r.is_fraud_case === true);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.client_name?.toLowerCase().includes(term) ||
        r.client_email?.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(filtered);
  };

  const handleApprove = async (request: Request) => {
    setProcessingId(request.id);
    
    const { data: { user } } = await supabase.auth.getUser();
    const sastTimestamp = new Date().toISOString();

    console.log('Approving request:', request.id, 'Type:', request.request_type, 'New Admin ID:', request.new_admin_id);

    // Update request status first
    const { error: updateError } = await supabase
      .from('unlock_requests')
      .update({
        status: 'approved',
        reviewed_by_admin_id: user?.id,
        reviewed_at: sastTimestamp
      })
      .eq('id', request.id);

    if (updateError) {
      console.error('Error updating request:', updateError);
      alert('Failed to approve request: ' + updateError.message);
      setProcessingId(null);
      return;
    }

    // Handle change_admin request - update client's assigned admin
    if (request.request_type === 'change_admin' && request.new_admin_id) {
      console.log('Updating client', request.client_id, 'to new admin', request.new_admin_id);
      
      const { data: updatedClient, error: clientUpdateError } = await supabase
        .from('user_roles')
        .update({ 
          assigned_admin_id: request.new_admin_id,
          updated_at: sastTimestamp
        })
        .eq('user_id', request.client_id)
        .select();

      if (clientUpdateError) {
        console.error('Error updating client admin:', clientUpdateError);
        alert('Request approved but failed to update client admin. Error: ' + clientUpdateError.message);
      } else {
        console.log('Client updated successfully:', updatedClient);
        alert(`Client ${request.client_email} has been migrated to new admin.`);
        
        // Re-run round-robin agent assignment for new admin
        await fetch('/api/agent/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            clientId: request.client_id, 
            adminId: request.new_admin_id 
          })
        });
      }
    } 
    // Handle unlock_form01 request
    else if (request.request_type === 'unlock_form01') {
      const { error: unlockError } = await supabase
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

      if (unlockError) {
        console.error('Error unlocking form:', unlockError);
        alert('Request approved but failed to unlock form. Error: ' + unlockError.message);
      } else {
        alert(`Form-01 has been unlocked for ${request.client_email}.`);
      }
    }

    await loadAllRequests();
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

    setShowRejectModal(false);
    setRejectionReason('');
    await loadAllRequests();
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

  const counts = {
    all: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
    fraud: allRequests.filter(r => r.is_fraud_case).length,
  };

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Client Requests History</h2>
          <p className="text-sm text-gray-500">View and manage all client requests</p>
        </div>
        <button onClick={loadAllRequests} className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by client name, email, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 border-b pb-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>All ({counts.all})</button>
        <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>Pending ({counts.pending})</button>
        <button onClick={() => setFilter('approved')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Approved ({counts.approved})</button>
        <button onClick={() => setFilter('rejected')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>Rejected ({counts.rejected})</button>
        <button onClick={() => setFilter('fraud')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'fraud' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>Fraud ({counts.fraud})</button>
      </div>

      {counts.fraud > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Fraud Alerts</h3>
          </div>
          <p className="text-sm text-red-700">{counts.fraud} client(s) have been flagged for unusual activity.</p>
        </div>
      )}

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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requested</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reviewed</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className={`hover:bg-gray-50 ${request.is_fraud_case ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{request.client_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{request.client_email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.request_type === 'change_admin' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {request.request_type === 'change_admin' ? '🔄 Change Admin' : '🔓 Unlock Form-01'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {request.request_type === 'change_admin' && request.new_admin && (
                        <div className="text-sm text-gray-600">New Admin: {request.new_admin.first_name} {request.new_admin.last_name}</div>
                      )}
                      <div className="text-sm mt-1 text-gray-500 line-clamp-2">{request.reason}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(request.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{request.reviewed_at ? new Date(request.reviewed_at).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(request)}</td>
                    <td className="px-4 py-3">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(request)} disabled={processingId === request.id} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                            Approve
                          </button>
                          <button onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }} disabled={processingId === request.id} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50">
                            Decline
                          </button>
                        </div>
                      )}
                      {(request.status === 'approved' || request.status === 'rejected') && (
                        <button onClick={() => setSelectedRequest(request)} className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                          View Details
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
            <p className="text-sm text-gray-600 mb-4">Declining request from <strong>{selectedRequest.client_name}</strong>.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for declining</label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); setSelectedRequest(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={() => handleDecline(selectedRequest)} disabled={processingId === selectedRequest.id || !rejectionReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg">Decline</button>
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
              <div><span className="text-sm text-gray-500">Client:</span><p className="font-medium">{selectedRequest.client_name}</p><p className="text-sm">{selectedRequest.client_email}</p></div>
              <div><span className="text-sm text-gray-500">Type:</span><p>{selectedRequest.request_type === 'change_admin' ? 'Change Admin' : 'Unlock Form-01'}</p></div>
              {selectedRequest.request_type === 'change_admin' && selectedRequest.new_admin && (
                <div><span className="text-sm text-gray-500">New Admin:</span><p>{selectedRequest.new_admin.first_name} {selectedRequest.new_admin.last_name}</p></div>
              )}
              <div><span className="text-sm text-gray-500">Reason:</span><p className="text-sm bg-gray-50 p-2 rounded">{selectedRequest.reason}</p></div>
              <div><span className="text-sm text-gray-500">Status:</span><p className="capitalize">{selectedRequest.status}</p></div>
              {selectedRequest.admin_notes && <div><span className="text-sm text-gray-500">Admin Notes:</span><p className="text-sm bg-red-50 p-2 rounded text-red-700">{selectedRequest.admin_notes}</p></div>}
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setSelectedRequest(null)} className="px-4 py-2 border rounded-lg">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
