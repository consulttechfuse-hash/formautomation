'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Eye, RefreshCw } from 'lucide-react';
import ViewForm01Data from './ViewForm01Data';

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
  const [showForm01Modal, setShowForm01Modal] = useState(false);
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

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No clients found</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{client.first_name || 'N/A'} {client.last_name || ''}</div>
                      <div className="text-xs text-gray-500">{client.user_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{client.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.has_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {client.has_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowForm01Modal(true);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> View Form-01
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Form-01 Modal */}
      {showForm01Modal && selectedClient && (
        <ViewForm01Data
          clientId={selectedClient.user_id}
          clientName={`${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim() || selectedClient.email}
          onClose={() => {
            setShowForm01Modal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
