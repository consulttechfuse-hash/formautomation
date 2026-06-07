'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EmailLog {
  id: string;
  agent_id: string;
  agent_name: string;
  client_email: string;
  client_name: string;
  subject: string;
  message: string;
  sent_at: string;
}

interface EmailLogsProps {
  role: 'owner' | 'admin' | 'agent';
}

export default function EmailLogs({ role }: EmailLogsProps) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('agent_email_logs')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error loading email logs:', error);
    } else {
      setLogs(data || []);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading email logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Client Communication History</h2>
        <button
          onClick={loadLogs}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🔄 Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No emails have been sent yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sent To</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sent By</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Subject</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sent Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium">{log.client_name || 'Client'}</div>
                    <div className="text-xs text-gray-500">{log.client_email}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{log.agent_name}</div>
                    <div className="text-xs text-gray-500">Agent</div>
                  </td>
                  <td className="px-4 py-2 text-sm max-w-xs truncate">{log.subject}</td>
                  <td className="px-4 py-2 text-sm">{new Date(log.sent_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Email Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">To</label>
                <p className="mt-1 text-gray-900">{selectedLog.client_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From Agent</label>
                <p className="mt-1 text-gray-900">{selectedLog.agent_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="mt-1 text-gray-900">{selectedLog.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sent Date</label>
                <p className="mt-1 text-gray-900">{new Date(selectedLog.sent_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedLog.message}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
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
