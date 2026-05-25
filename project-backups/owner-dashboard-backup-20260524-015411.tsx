'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  email: string
  fn_t1?: string
  srn_t1?: string
  idp_t1?: string
  has_consented: boolean
  has_paid: boolean
  onboarding_complete: boolean
  onboarding_submitted: boolean
  admin_id: string | null
  created_at: string
}

type Admin = {
  id: string
  email: string
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [allClients, setAllClients] = useState<Client[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null)
  const [showClientForms, setShowClientForms] = useState(false)
  const [clientForms, setClientForms] = useState<any[]>([])
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndFetchData()
  }, [filterAgent, filterStatus, searchTerm])

  async function checkAuthAndFetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      router.push('/client/dashboard')
      return
    }

    await Promise.all([
      fetchStats(),
      fetchAllClients(),
      fetchAdmins()
    ])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function fetchStats() {
    const { data: allClientsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')

    const totalSignups = allClientsData?.length || 0
    const totalConsents = allClientsData?.filter(c => c.has_consented).length || 0
    const totalPaid = allClientsData?.filter(c => c.has_paid).length || 0
    const totalForm01Complete = allClientsData?.filter(c => c.onboarding_complete).length || 0
    const totalFormsSubmitted = allClientsData?.filter(c => c.onboarding_submitted).length || 0
    const revenue = totalPaid * 200
    const abandonedSignups = allClientsData?.filter(c => !c.has_consented && !c.has_paid).length || 0

    setStats({
      totalSignups,
      totalConsents,
      totalPaid,
      totalForm01Complete,
      totalFormsSubmitted,
      revenue,
      abandonedSignups
    })
  }

  async function fetchAdmins() {
    const { data } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin')
    setAdmins(data || [])
  }

  async function fetchAllClients() {
    const { data: clientsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false })
    
    const clientsWithFormData = await Promise.all(
      (clientsData || []).map(async (client) => {
        const { data: form01 } = await supabase
          .from('form01_data')
          .select('fn_t1, srn_t1, idp_t1')
          .eq('user_id', client.id)
          .single()
        
        return {
          ...client,
          fn_t1: form01?.fn_t1 || '',
          srn_t1: form01?.srn_t1 || '',
          idp_t1: form01?.idp_t1 || ''
        }
      })
    )
    
    setAllClients(clientsWithFormData)
    filterClients(clientsWithFormData)
  }

  function filterClients(data = allClients) {
    let filtered = [...data]

    if (filterAgent !== 'all') {
      filtered = filtered.filter(c => c.admin_id === filterAgent)
    }

    if (filterStatus === 'paid') {
      filtered = filtered.filter(c => c.has_paid === true)
    } else if (filterStatus === 'non_paid') {
      filtered = filtered.filter(c => c.has_paid === false)
    } else if (filterStatus === 'consented') {
      filtered = filtered.filter(c => c.has_consented === true)
    } else if (filterStatus === 'forms_submitted') {
      filtered = filtered.filter(c => c.onboarding_submitted === true)
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.email.toLowerCase().includes(term) ||
        (c.fn_t1 && c.fn_t1.toLowerCase().includes(term)) ||
        (c.srn_t1 && c.srn_t1.toLowerCase().includes(term)) ||
        (c.idp_t1 && c.idp_t1.toLowerCase().includes(term))
      )
    }

    setClients(filtered)
  }

  async function viewClientForms(client: Client) {
    const { data } = await supabase
      .from('generated_forms')
      .select('form_number, filled_html, submitted_at')
      .eq('user_id', client.id)
      .order('form_number', { ascending: true })
    
    setClientForms(data || [])
    setSelectedClientForView(client)
    setShowClientForms(true)
    setSelectedForm(null)
  }

  function exportToCSV() {
    const headers = ['Name', 'Surname', 'Email', 'ID/Passport', 'Consented', 'Paid', 'Form-01', 'Submitted', 'Created At']
    const rows = clients.map(c => [
      c.fn_t1 || '',
      c.srn_t1 || '',
      c.email,
      c.idp_t1 || '',
      c.has_consented ? 'Yes' : 'No',
      c.has_paid ? 'Yes' : 'No',
      c.onboarding_complete ? 'Yes' : 'No',
      c.onboarding_submitted ? 'Yes' : 'No',
      new Date(c.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stageData = [
    { name: 'Signed Up', count: stats?.totalSignups || 0 },
    { name: 'Consented', count: stats?.totalConsents || 0 },
    { name: 'Paid', count: stats?.totalPaid || 0 },
    { name: 'Form-01 Done', count: stats?.totalForm01Complete || 0 },
    { name: 'Submitted', count: stats?.totalFormsSubmitted || 0 },
  ]

  const maxCount = Math.max(...stageData.map(s => s.count), 1)

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Client Forms Modal */}
      {showClientForms && selectedClientForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">View Client Forms</h2>
                <p className="text-sm text-gray-500">
                  {selectedClientForView.fn_t1} {selectedClientForView.srn_t1} - {selectedClientForView.email}
                </p>
              </div>
              <button onClick={() => setShowClientForms(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-64 border-r overflow-y-auto p-2">
                <h3 className="font-semibold mb-2 px-2">Forms</h3>
                {clientForms.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No forms found</p>
                ) : (
                  <div className="space-y-1">
                    {clientForms.map((form) => (
                      <button
                        key={form.form_number}
                        onClick={() => setSelectedForm(form)}
                        className={`w-full text-left px-3 py-2 rounded text-sm ${
                          selectedForm?.form_number === form.form_number
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        Form {String(form.form_number).padStart(2, '0')}
                        {form.submitted_at && <span className="text-xs text-green-600 ml-2">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {selectedForm ? (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Form {String(selectedForm.form_number).padStart(2, '0')}</h3>
                    <div dangerouslySetInnerHTML={{ __html: selectedForm.filled_html }} />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-20">Select a form to view</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Sign Out</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-lg p-4"><div className="text-sm opacity-90">Total Signups</div><div className="text-3xl font-bold">{stats?.totalSignups}</div></div>
        <div className="bg-green-500 text-white rounded-lg p-4"><div className="text-sm opacity-90">Consents Given</div><div className="text-3xl font-bold">{stats?.totalConsents}</div></div>
        <div className="bg-purple-500 text-white rounded-lg p-4"><div className="text-sm opacity-90">Paid (R400)</div><div className="text-3xl font-bold">{stats?.totalPaid}</div></div>
        <div className="bg-yellow-500 text-white rounded-lg p-4"><div className="text-sm opacity-90">Form-01 Complete</div><div className="text-3xl font-bold">{stats?.totalForm01Complete}</div></div>
        <div className="bg-indigo-500 text-white rounded-lg p-4"><div className="text-sm opacity-90">Forms Submitted</div><div className="text-3xl font-bold">{stats?.totalFormsSubmitted}</div></div>
        <div className="bg-red-500 text-white rounded-lg p-4"><div className="text-sm opacity-90">Revenue (50%)</div><div className="text-3xl font-bold">R{stats?.revenue}</div></div>
      </div>

      {/* Stage Chart */}
      <div className="bg-white rounded-lg shadow mb-8 p-4">
        <h2 className="text-lg font-semibold mb-4">Client Progress by Stage</h2>
        <div className="space-y-3">
          {stageData.map((stage) => (
            <div key={stage.name}>
              <div className="flex justify-between text-sm mb-1"><span>{stage.name}</span><span>{stage.count}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${(stage.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px]">
            <input type="text" placeholder="Search by name, email, or ID/Passport..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div className="flex gap-4">
            <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">All Agents</option>
              {admins.map(admin => <option key={admin.id} value={admin.id}>{admin.email}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">All</option><option value="paid">Paid Only</option><option value="non_paid">Non-Paying</option>
              <option value="consented">Consented Only</option><option value="forms_submitted">Forms Submitted</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export to CSV</button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">All Clients</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">ID/Passport</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Actions</th></tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-4 py-2">{client.fn_t1 || '-'} {client.srn_t1 || '-'}</td>
                  <td className="px-4 py-2">{client.email}</td>
                  <td className="px-4 py-2">{client.idp_t1 || '-'}</td>
                  <td className="px-4 py-2">{client.onboarding_submitted ? '✅ Submitted' : client.onboarding_complete ? '📝 Form-01 Done' : client.has_paid ? '💰 Paid' : client.has_consented ? '📋 Consented' : '🆕 Signed Up'}</td>
                  <td className="px-4 py-2"><button onClick={() => viewClientForms(client)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">View Forms</button></td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No clients found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
