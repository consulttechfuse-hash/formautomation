'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import FormViewer from '../../components/FormViewer';
import { getFormData } from '../../components/getFormData';

interface Client {
  id: string;
  email: string;
  admin_id: string;
  has_paid: boolean;
  has_consented: boolean;
  onboarding_submitted: boolean;
  fn_t1: string;
  srn_t1: string;
  idp_t1: string;
  created_at: string;
  status?: string;
}

export default function ClientManagement() {
  const [searchEmail, setSearchEmail] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedForm, setSelectedForm] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [viewingForm, setViewingForm] = useState(false);
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .ilike('email', `%${searchEmail}%`);
    
    setClients(data as Client[] || []);
    setShowResults(true);
    setLoading(false);
  };

  const handleShowAll = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client');
    
    setClients(data as Client[] || []);
    setShowResults(true);
    setLoading(false);
  };

  const handleClear = () => {
    setSearchEmail('');
    setClients([]);
    setShowResults(false);
    setSelectedClient(null);
    setFormData(null);
    setViewingForm(false);
    setSelectedForm('');
  };

  const handleViewForm = async (client: Client, formNumber: string) => {
    setSelectedClient(client);
    setSelectedForm(formNumber);
    setLoading(true);
    
    const formNum = parseInt(formNumber);
    let data = null;
    
    if (formNum === 1) {
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('*')
        .eq('user_id', client.id)
        .single();
      data = form01;
    } else {
      data = await getFormData(client.id, formNum);
    }
    
    setFormData(data);
    setViewingForm(true);
    setLoading(false);
  };

  const closeFormView = () => {
    setViewingForm(false);
    setFormData(null);
    setSelectedForm('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Client Management</h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={handleShowAll}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
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
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Form</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-t">
                        <td className="p-2">{client.email}</td>
                        <td className="p-2">
                          <select
                            onChange={(e) => setSelectedForm(e.target.value)}
                            className="p-1 border rounded text-sm"
                            defaultValue=""
                          >
                            <option value="" disabled>Select Form</option>
                            {[...Array(17)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Form {(i + 1).toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleViewForm(client, selectedForm || '1')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            View Form
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

        {!showResults && (
          <div className="bg-gray-50 p-8 rounded text-center text-gray-500">
            🔍 Enter an email and click Search, or click Show All Clients
          </div>
        )}
      </div>

      {viewingForm && formData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                Form {selectedForm} - {selectedClient?.email}
              </h2>
              <button onClick={closeFormView} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              <FormViewer 
                formData={formData} 
                formNumber={selectedForm} 
                clientEmail={selectedClient?.email || ''} 
                showEditButton={true} 
                showAddField={false} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
