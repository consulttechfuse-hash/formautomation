'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UnlockRequest {
  id: string;
  client_id: string;
  form_number: number;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  requested_by: string;
  requester_email: string;
  requester_name: string;
  client_email: string;
}

export default function UnlockRequests() {
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<UnlockRequest | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUnlockRequests();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('unlock_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'unlock_requests' }, 
        () => loadUnlockRequests()
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUnlockRequests = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('unlock_requests')
      .select(`
        id,
        client_id,
        form_number,
        reason,
        status,
        created_at,
        requested_by,
        requested_by_user:requested_by (email, fn_t1, srn_t1),
        client:client_id (email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading unlock requests:', error);
    }
    
    const formattedRequests = (data || []).map((req: any) => ({
      id: req.id,
      client_id: req.client_id,
      form_number: req.form_number,
      reason: req.reason,
      status: req.status,
      created_at: req.created_at,
      requested_by: req.requested_by,
      requester_email: req.requested_by_user?.email || 'Unknown',
      requester_name: req.requested_by_user?.fn_t1 
        ? `${req.requested_by_user.fn_t1} ${req.requested_by_user.srn_t1 || ''}`.trim()
        : 'Agent',
      client_email: req.client?.email || 'Unknown'
    }));
    
    setRequests(formattedRequests);
    setLoading(false);
  };

  const handleApprove = async (request: UnlockRequest) => {
    if (!confirm(`Approve unlock request for Form ${request.form_number} from ${request.requester_email}?`)) return;
    
    setProcessingId(request.id);
    
    const response = await fetch('/api/admin/unlock-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: request.id,
        status: 'approved',
        adminNotes: adminNotes || 'Approved by admin'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert(result.message || 'Request approved successfully');
      setAdminNotes('');
      setSelectedRequest(null);
      await loadUnlockRequests();
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
    
    setProcessingId(null);
  };

  const handleDecline = async (request: UnlockRequest) => {
    const reason = prompt('Please provide a reason for declining:');
    if (!reason) return;
    
    setProcessingId(request.id);
    
    const response = await fetch('/api/admin/unlock-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: request.id,
        status: 'declined',
        adminNotes: reason
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert(result.message || 'Request declined');
      setSelectedRequest(null);
      await loadUnlockRequests();
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
    
    setProcessingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Unlock Requests</h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          {requests.length} Pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No pending unlock requests
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      Form {request.form_number} Unlock Request
                    </h3>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Requested By (Agent)</p>
                      <p className="font-medium">{request.requester_name}</p>
                      <p className="text-sm text-gray-600">{request.requester_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{request.client_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Request Date</p>
                      <p className="font-medium">{formatDate(request.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Reason for Request</p>
                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                      <p className="text-gray-700">{request.reason}</p>
                    </div>
                  </div>
                  
                  {selectedRequest?.id === request.id && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Add any notes about this decision..."
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {selectedRequest?.id === request.id ? (
                    <>
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === request.id ? 'Processing...' : 'Confirm Approve'}
                      </button>
                      <button
                        onClick={() => handleDecline(request)}
                        disabled={processingId === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {processingId === request.id ? 'Processing...' : 'Confirm Decline'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(null);
                          setAdminNotes('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Review Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
