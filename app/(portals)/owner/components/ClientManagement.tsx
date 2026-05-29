'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import FormViewer from './FormViewer';

interface Client {
  id: string;
  email: string;
  admin_id: string;
  has_paid: boolean;
  has_consented: boolean;
  onboarding_submitted: boolean;
  fn_t1: string;
  fln_t1: string;
  idp_t1: string;
  cnt_1: string;
  created_at: string;
  status?: string;
}

export default function ClientManagement() {
  const [searchEmail, setSearchEmail] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedForm, setSelectedForm] = useState<number | null>(null);
  const [viewingForm, setViewingForm] = useState(false);
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, email, role, has_paid, has_consented, onboarding_submitted, created_at')
      .eq('role', 'client')
      .ilike('email', `%${searchEmail}%`);
    
    // Get additional form01 data
    const enrichedClients = await Promise.all((data || []).map(async (client) => {
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('fn_t1, fln_t1, idp_t1, cnt_1')
        .eq('user_id', client.user_id)
        .single();
      
      return {
        id: client.user_id,
        email: client.email,
        admin_id: '',
        has_paid: client.has_paid || false,
        has_consented: client.has_consented || false,
        onboarding_submitted: client.onboarding_submitted || false,
        fn_t1: form01?.fn_t1 || '',
        fln_t1: form01?.fln_t1 || '',
        idp_t1: form01?.idp_t1 || '',
        cnt_1: form01?.cnt_1 || '',
        created_at: client.created_at
      };
    }));
    
    setClients(enrichedClients as Client[]);
    setShowResults(true);
    setLoading(false);
  };

  const handleShowAll = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, email, role, has_paid, has_consented, onboarding_submitted, created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    
    const enrichedClients = await Promise.all((data || []).map(async (client) => {
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('fn_t1, fln_t1, idp_t1, cnt_1')
        .eq('user_id', client.user_id)
        .single();
      
      return {
        id: client.user_id,
        email: client.email,
        admin_id: '',
        has_paid: client.has_paid || false,
        has_consented: client.has_consented || false,
        onboarding_submitted: client.onboarding_submitted || false,
        fn_t1: form01?.fn_t1 || '',
        fln_t1: form01?.fln_t1 || '',
        idp_t1: form01?.idp_t1 || '',
        cnt_1: form01?.cnt_1 || '',
        created_at: client.created_at
      };
    }));
    
    setClients(enrichedClients as Client[]);
    setShowResults(true);
    setLoading(false);
  };

  const handleClear = () => {
    setSearchEmail('');
    setClients([]);
    setShowResults(false);
    setSelectedClient(null);
    setViewingForm(false);
    setSelectedForm(null);
  };

  const handleViewForm = (client: Client, formNumber: number) => {
    setSelectedClient(client);
    setSelectedForm(formNumber);
    setViewingForm(true);
  };

  const closeFormView = () => {
    setViewingForm(false);
    setSelectedClient(null);
    setSelectedForm(null);
  };

  const getFormStatus = (client: Client, formNumber: number): 'completed' | 'pending' | 'locked' => {
    // This would check generated_forms for completion status
    return 'pending';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Client Management</h2>
        
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 p-2 border rounded min-w-[200px]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
          <button
            onClick={handleShowAll}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Show All Clients
          </button>
          {showResults && (
            <button
              onClick={handleClear}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Clear
            </button>
          )}
        </div>

        {showResults && (
          <>
            {clients.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded text-center">No clients found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left border">Email</th>
                      <th className="p-2 text-left border">Name</th>
                      <th className="p-2 text-left border">Phone</th>
                      <th className="p-2 text-left border">Forms</th>
                      <th className="p-2 text-left border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{client.email}</td>
                        <td className="p-2 border">{client.fn_t1} {client.fln_t1}</td>
                        <td className="p-2 border">{client.cnt_1 || '-'}</td>
                        <td className="p-2 border">
                          <div className="flex gap-1 flex-wrap">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((num) => (
                              <span
                                key={num}
                                onClick={() => handleViewForm(client, num)}
                                className={`cursor-pointer text-xs px-2 py-1 rounded transition-colors ${
                                  getFormStatus(client, num) === 'completed'
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 border">
                          <button
                            onClick={() => handleViewForm(client, 1)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Data
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Viewer Modal */}
      {viewingForm && selectedClient && selectedForm && (
        <FormViewer
          clientId={selectedClient.id}
          formNumber={selectedForm}
          userRole="owner"
          onClose={closeFormView}
          onSave={handleShowAll}
        />
      )}
    </div>
  );
}
