'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, RefreshCw, Eye } from 'lucide-react';
import ViewClientForms from './ViewClientForms';

interface Client {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  has_paid: boolean;
  created_at: string;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showFormsViewer, setShowFormsViewer] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data);
    }
    
    setLoading(false);
  };

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
          <p className="text-sm text-gray-500">View all clients and their form data</p>
        </div>
        <button
          onClick={loadClients}
          className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Clients Table - No Actions column, View Forms is the only action */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">View Forms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No clients found</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{client.first_name || 'N/A'} {client.last_name || ''}</div>
                      <div className="text-xs text-gray-500">{client.user_id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{client.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.has_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {client.has_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowFormsViewer(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> View Forms
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms Viewer Modal */}
      {showFormsViewer && selectedClient && (
        <ViewClientForms
          clientId={selectedClient.user_id}
          clientName={`${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim() || selectedClient.email}
          onClose={() => {
            setShowFormsViewer(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
