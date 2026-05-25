'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getFormData } from '../../components/getFormData'
import FormViewer from '../../components/FormViewer'
import UserProfile from '../components/UserProfile'
import AgentPaymentStatus from '../components/PaymentStatusView'
import ClientStatusChart from '../components/charts/ClientStatusChart'
import CompletionProgressBar from '../components/charts/CompletionProgressBar'
import UnlockRequestsChart from '../components/charts/UnlockRequestsChart'

interface Client {
  id: string
  email: string
  admin_id: string
  has_paid: boolean
  has_consented: boolean
  onboarding_submitted: boolean
  fn_t1: string
  srn_t1: string
  idp_t1: string
  created_at: string
}

export default function AgentDashboard() {
  const [allClients, setAllClients] = useState<Client[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedForm, setSelectedForm] = useState<number>(1)
  const [viewFormData, setViewFormData] = useState<{ formData: any; clientName: string; formNumber: number } | null>(null)
  const [unlockReason, setUnlockReason] = useState('')
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [selectedClientForUnlock, setSelectedClientForUnlock] = useState<Client | null>(null)
  const [unlockRequests, setUnlockRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agentName, setAgentName] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [hasSearched, setHasSearched] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const formOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  async function checkAuthAndFetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase.from('users').select('role, admin_id, email').eq('id', user.id).single()
    if (profile?.role !== 'agent') {
      router.push('/client/dashboard')
      return
    }

    setAgentName(profile.email)

    const { data: clientsData } = await supabase.from('users').select('*').eq('role', 'client').eq('agent_id', user.id).order('created_at', { ascending: false })
    const clientsWithFormData = await Promise.all((clientsData || []).map(async (client) => {
      const { data: form01 } = await supabase.from('form01_data').select('fn_t1, srn_t1, idp_t1').eq('user_id', client.id).single()
      return { ...client, fn_t1: form01?.fn_t1 || '', srn_t1: form01?.srn_t1 || '', idp_t1: form01?.idp_t1 || '' }
    }))
    setAllClients(clientsWithFormData)

    const { data: requests } = await supabase.from('unlock_requests').select('*').eq('requested_by', user.id).order('created_at', { ascending: false })
    setUnlockRequests(requests || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function filterClients(data = allClients) {
    let filtered = [...data]
    if (filterStatus === 'paid') filtered = filtered.filter(c => c.has_paid === true)
    else if (filterStatus === 'non_paid') filtered = filtered.filter(c => c.has_paid === false)
    else if (filterStatus === 'consented') filtered = filtered.filter(c => c.has_consented === true)
    else if (filterStatus === 'forms_submitted') filtered = filtered.filter(c => c.onboarding_submitted === true)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => c.email.toLowerCase().includes(term) || (c.fn_t1 && c.fn_t1.toLowerCase().includes(term)) || (c.srn_t1 && c.srn_t1.toLowerCase().includes(term)) || (c.idp_t1 && c.idp_t1.toLowerCase().includes(term)))
    }
    setClients(filtered)
  }

  function handleSearch() {
    setHasSearched(true)
    filterClients(allClients)
  }

  function handleClear() {
    setSearchTerm('')
    setFilterStatus('all')
    setHasSearched(false)
    setClients([])
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  function handleFilterChange(value: string) {
    setFilterStatus(value)
    setHasSearched(true)
    setTimeout(() => filterClients(allClients), 0)
  }

  async function viewClientForm(client: Client, formNumber: number) {
    let formData = null;
    
    if (formNumber === 1) {
      const { data: form01 } = await supabase.from("form01_data").select("*").eq("user_id", client.id).single();
      formData = form01;
    } else {
      formData = await getFormData(client.id, formNumber);
    }
    
    if (formData) {
      setViewFormData({ formData, clientName: `${client.fn_t1 || ""} ${client.srn_t1 || ""}`.trim() || client.email, formNumber });
    } else {
      alert(`Form ${formNumber} not available for this client.`);
    }
  }

  function requestUnlock(client: Client) {
    setSelectedClientForUnlock(client)
    setUnlockReason('')
    setShowUnlockModal(true)
  }

  async function submitUnlockRequest() {
    if (!selectedClientForUnlock || !unlockReason) {
      alert('Please provide a reason for the unlock request')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('unlock_requests').insert({
      client_id: selectedClientForUnlock.id,
      requested_by: user.id,
      reason: unlockReason,
      form_number: selectedForm,
      status: 'pending'
    })

    if (error) {
      alert('Error submitting request: ' + error.message)
    } else {
      alert('Unlock request submitted successfully')
      setShowUnlockModal(false)
      setUnlockReason('')
      setSelectedClientForUnlock(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const totalClients = allClients.length
  const pendingRequests = unlockRequests.filter(r => r.status === 'pending').length

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b"><h1 className="text-xl font-bold">Agent Portal</h1><p className="text-sm text-gray-600">{agentName}</p></div>
        <nav className="p-4 space-y-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('clients')} className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'clients' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>👥 Clients</button>
          <button onClick={() => setActiveTab('requests')} className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'requests' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>📋 My Requests</button>
          <button onClick={() => setActiveTab('paymentStatus')} className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'paymentStatus' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>💰 Payment Status</button>
        </nav>
        <UserProfile />
        <div className="p-4 border-t"><button onClick={handleSignOut} className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Sign Out</button></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-500 text-white rounded-lg p-6"><div className="text-sm opacity-90">Total Clients</div><div className="text-4xl font-bold">{totalClients}</div></div>
              <div className="bg-yellow-500 text-white rounded-lg p-6"><div className="text-sm opacity-90">Pending Requests</div><div className="text-4xl font-bold">{pendingRequests}</div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientStatusChart />
              <CompletionProgressBar />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
              <UnlockRequestsChart />
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Clients</h2>
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <div className="flex flex-wrap gap-4">
                <input type="text" placeholder="Search by name, email, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 border rounded-lg px-4 py-2" />
                <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Search</button>
                <button onClick={handleClear} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Clear</button>
                <select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)} className="border rounded px-3 py-2">
                  <option value="all">All Clients</option>
                  <option value="paid">Paid Only</option>
                  <option value="non_paid">Non-Paying</option>
                  <option value="consented">Consented</option>
                  <option value="forms_submitted">Submitted</option>
                </select>
              </div>
            </div>
            {!hasSearched ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center text-gray-500">🔍 Enter a search term and click &quot;Search&quot; or select a filter to view clients</div>
            ) : clients.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center text-yellow-700">No clients found matching your criteria</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">ID/Passport</th><th className="px-4 py-2 text-left">Form</th><th className="px-4 py-2 text-left">Actions</th></tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-t">
                          <td className="px-4 py-2">{client.fn_t1 || '-'} {client.srn_t1 || '-'}</td>
                          <td className="px-4 py-2">{client.email}</td>
                          <td className="px-4 py-2">{client.idp_t1 || '-'}</td>
                          <td className="px-4 py-2"><select value={selectedForm} onChange={(e) => setSelectedForm(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">{formOptions.map(n => <option key={n} value={n}>Form {n.toString().padStart(2, '0')}</option>)}</select></td>
                          <td className="px-4 py-2"><div className="flex gap-2"><button onClick={() => viewClientForm(client, selectedForm)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">View</button><button onClick={() => requestUnlock(client)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">Request Unlock</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Unlock Requests</h2>
            {unlockRequests.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">No unlock requests submitted</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr><th className="px-4 py-2 text-left">Client</th><th className="px-4 py-2 text-left">Form</th><th className="px-4 py-2 text-left">Reason</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Submitted</th></tr>
                    </thead>
                    <tbody>
                      {unlockRequests.map(req => (
                        <tr key={req.id} className="border-t">
                          <td className="px-4 py-2">{req.client_id}</td>
                          <td className="px-4 py-2">Form {req.form_number}</td>
                          <td className="px-4 py-2">{req.reason}</td>
                          <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span></td>
                          <td className="px-4 py-2">{new Date(req.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'paymentStatus' && <AgentPaymentStatus />}
      </div>

      {/* Unlock Request Modal */}
      {showUnlockModal && selectedClientForUnlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-bold">Request Form Unlock</h2><button onClick={() => setShowUnlockModal(false)} className="text-gray-500 text-2xl">&times;</button></div>
            <div className="p-4">
              <p className="mb-4">Client: <strong>{selectedClientForUnlock.fn_t1} {selectedClientForUnlock.srn_t1}</strong></p>
              <p className="mb-4">Form: <strong>Form {selectedForm}</strong></p>
              <label className="block text-sm font-medium mb-1">Reason for unlock request:</label>
              <textarea value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} rows={4} className="w-full border rounded p-2" placeholder="Please explain why this form needs to be unlocked..." />
              <div className="flex justify-end gap-2 mt-4"><button onClick={() => setShowUnlockModal(false)} className="px-4 py-2 border rounded">Cancel</button><button onClick={submitUnlockRequest} className="px-4 py-2 bg-blue-600 text-white rounded">Submit Request</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Form View Modal */}
      {viewFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white"><h2 className="text-xl font-bold">Form {viewFormData.formNumber.toString().padStart(2, '0')} - {viewFormData.clientName}</h2><button onClick={() => setViewFormData(null)} className="text-gray-500 text-2xl">&times;</button></div>
            <div className="p-4"><FormViewer formData={viewFormData.formData} formNumber={viewFormData.formNumber} clientEmail={viewFormData.clientName} showEditButton={true} showAddField={false} /></div>
          </div>
        </div>
      )}
    </div>
  )
}
