'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ContactModal from './ContactModal';

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

interface AssignedClient {
  email: string;
  name: string;
  user_id: string;
}

export default function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [clients, setClients] = useState<AssignedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; email: string; name: string }>({
    isOpen: false,
    email: '',
    name: ''
  });
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Load email logs
    const { data: logsData, error: logsError } = await supabase
      .from('agent_email_logs')
      .select('*')
      .eq('agent_id', user.id)
      .order('sent_at', { ascending: false });

    if (!logsError) {
      setLogs(logsData || []);
    }

    // 2. Load ALL assigned clients (FIX: not just those with email history)
    const { data: assignedClients, error: clientsError } = await supabase
      .from('user_roles')
      .select('email, first_name, last_name, user_id')
      .eq('role', 'client')
      .eq('assigned_agent_id', user.id);

    if (!clientsError && assignedClients) {
      const formattedClients = assignedClients.map(client => ({
        email: client.email,
        name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email.split('@')[0],
        user_id: client.user_id
      }));
      setClients(formattedClients);
    }
    
    setLoading(false);
  };

  const handleClientSelect = (email: string) => {
    const selected = clients.find(c => c.email === email);
    if (selected) {
      setContactModal({
        isOpen: true,
        email: selected.email,
        name: selected.name
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Send New Email Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Send New Email</h2>
        <p className="text-sm text-gray-600 mb-4">
          Send an email to a client. You can attach documents up to 5MB.
        </p>
        
        {clients.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            No clients assigned to you yet. Clients will appear here once they select your admin and are assigned to you.
          </div>
        ) : (
          <div className="flex gap-4">
            <select
              onChange={(e) => handleClientSelect(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>Select a client...</option>
              {clients.map((client) => (
                <option key={client.email} value={client.email}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (clients.length > 0) {
                  setContactModal({
                    isOpen: true,
                    email: clients[0].email,
                    name: clients[0].name
                  });
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Compose Email
            </button>
          </div>
        )}
      </div>

      {/* Email History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sent Email History</h2>
          <button onClick={loadData} className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
            🔄 Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No emails sent yet. Select a client above to send your first email.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
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
      </div>

      {/* View Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Email Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">To</label><p className="mt-1 text-gray-900">{selectedLog.client_email}</p></div>
              <div><label className="block text-sm font-medium text-gray-700">Subject</label><p className="mt-1 text-gray-900">{selectedLog.subject}</p></div>
              <div><label className="block text-sm font-medium text-gray-700">Sent Date</label><p className="mt-1 text-gray-900">{new Date(selectedLog.sent_at).toLocaleString()}</p></div>
              <div><label className="block text-sm font-medium text-gray-700">Message</label><div className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedLog.message}</div></div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, email: '', name: '' })}
        clientEmail={contactModal.email}
        clientName={contactModal.name}
        onSuccess={() => {
          loadData();
          setContactModal({ isOpen: false, email: '', name: '' });
        }}
      />
    </div>
  );
}
