'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RequestsStats() {
  const [stats, setStats] = useState({ total: 0, approved: 0, declined: 0, pending: 0 });
  const [requests, setRequests] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    // Get unlock requests
    const { data: unlockRequests } = await supabase
      .from('unlock_requests')
      .select('*, users!unlock_requests_user_id_fkey(email, role)')
      .order('created_at', { ascending: false });

    if (unlockRequests) {
      const total = unlockRequests.length;
      const approved = unlockRequests.filter(r => r.status === 'approved').length;
      const declined = unlockRequests.filter(r => r.status === 'declined').length;
      const pending = unlockRequests.filter(r => r.status === 'pending' || !r.status).length;
      setStats({ total, approved, declined, pending });
      setRequests(unlockRequests);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Requests Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Requests</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Declined</p>
          <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Recent Unlock Requests</h3>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No requests found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Form</th>
                  <th className="p-2 text-left">Reason</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="p-2">{req.users?.email || 'N/A'}</td>
                    <td className="p-2">Form {req.form_number || '?'}</td>
                    <td className="p-2 max-w-xs truncate">{req.reason || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {req.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-2 text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
