'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Client = {
  id: string
  email: string
  fn_t1?: string
  srn_t1?: string
  idp_t1?: string
}

type FormData = {
  form_number: number
  filled_html: string
  submitted_at: string
}

export function ClientFormViewer({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (client) {
      loadClientForms()
    }
  }, [client])

  async function loadClientForms() {
    if (!client) return
    setLoading(true)
    
    const { data } = await supabase
      .from('generated_forms')
      .select('form_number, filled_html, submitted_at')
      .eq('user_id', client.id)
      .order('form_number', { ascending: true })
    
    setForms(data || [])
    setLoading(false)
  }

  if (!client) return null

  const selectedFormData = forms.find(f => f.form_number === selectedForm)

  const clientName = client.fn_t1 && client.srn_t1 
    ? `${client.fn_t1} ${client.srn_t1}`
    : client.email

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">View Client Forms</h2>
            <p className="text-sm text-gray-500">{clientName}</p>
            {client.idp_t1 && (
              <p className="text-xs text-gray-400">ID: {client.idp_t1}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form list sidebar */}
          <div className="w-64 border-r overflow-y-auto p-2">
            <h3 className="font-semibold mb-2 px-2">Forms</h3>
            {loading ? (
              <p className="text-sm text-gray-500 p-2">Loading...</p>
            ) : forms.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No forms found</p>
            ) : (
              <div className="space-y-1">
                {forms.map((form) => (
                  <button
                    key={form.form_number}
                    onClick={() => setSelectedForm(form.form_number)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedForm === form.form_number
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Form {String(form.form_number).padStart(2, '0')}
                    {form.submitted_at && (
                      <span className="text-xs text-green-600 ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form preview */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {selectedFormData ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Form {String(selectedFormData.form_number).padStart(2, '0')}</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedFormData.filled_html }}
                />
                {selectedFormData.submitted_at && (
                  <p className="text-xs text-gray-400 mt-4 pt-4 border-t">
                    Submitted: {new Date(selectedFormData.submitted_at).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                Select a form to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
