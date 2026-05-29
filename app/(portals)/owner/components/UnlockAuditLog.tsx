'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UnlockAuditEntry {
  id: string;
  client_id: string;
  form_number: number;
  reason: string;
  status: string;
  requested_by: string;
  reviewed_by: string;
  admin_notes: string;
  created_at: string;
  reviewed_at: string;
  requester_email: string;
  reviewer_email: string;
  client_email: string;
}

export default function UnlockAuditLog() {
  const [logs, setLogs] = useState<UnlockAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, declined
  const supabase = createClient();

  useEffect(() => {
    loadAuditLogs();
  }, [filter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    
    let query = supabase
      .from('unlock_requests')
      .select(`
        id,
        client_id,
        form_number,
        reason,
        status,
        requested_by,
        reviewed_by,
        admin_notes,
        created_at,
        reviewed_at,
        requester:requested_by (email),
        reviewer:reviewed_by (email),
        client:client_id (email)
      `)
      .not('reviewed_by', 'is', null);
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    const { data } = await query.order('reviewed_at', { ascending: false }).limit(50);
    
    const formattedLogs = (data || []).map((log: any) => ({
      ...log,
      requester_email: log.requester?.email || 'Unknown',
      reviewer_email: log.reviewer?.email || 'Unknown',
      client_email: log.client?.email || 'Unknown'
    }));
    
    setLogs(formattedLogs);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Approved</span>;
      case 'declined':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Declined</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading audit log...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Unlock Request Audit Log</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded text-sm ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('declined')}
            className={`px-3 py-1 rounded text-sm ${filter === 'declined' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Declined
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No audit records found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left border">Date</th>
                <th className="p-3 text-left border">Client</th>
                <th className="p-3 text-left border">Form</th>
                <th className="p-3 text-left border">Requested By</th>
                <th className="p-3 text-left border">Reason</th>
                <th className="p-3 text-left border">Status</th>
                <th className="p-3 text-left border">Reviewed By</th>
                <th className="p-3 text-left border">Admin Notes</th>
               </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 border text-sm">
                    {new Date(log.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 border text-sm">{log.client_email}</td>
                  <td className="p-3 border text-sm">Form {log.form_number}</td>
                  <td className="p-3 border text-sm">{log.requester_email}</td>
                  <td className="p-3 border text-sm max-w-xs truncate">{log.reason}</td>
                  <td className="p-3 border">{getStatusBadge(log.status)}</td>
                  <td className="p-3 border text-sm">{log.reviewer_email}</td>
                  <td className="p-3 border text-sm max-w-xs truncate">{log.admin_notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
