'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function FormsCompletePage() {
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [generatedForms, setGeneratedForms] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchGeneratedForms()
  }, [])

  async function fetchGeneratedForms() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('generated_forms')
      .select('*')
      .eq('user_id', user.id)
      .order('form_number', { ascending: true })

    setGeneratedForms(data || [])
  }

  async function handleFinalSubmit() {
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('generated_forms')
      .update({ is_locked: true, is_submitted: true, submitted_at: new Date().toISOString() })
      .eq('user_id', user.id)

    await supabase
      .from('users')
      .update({ onboarding_submitted: true })
      .eq('id', user.id)

    setSubmitting(false)
    setShowConfirm(false)
    alert('All forms have been submitted and locked.')
  }

  async function downloadAsPDF(form: any) {
    const printWindow = window.open('', '_blank')
    printWindow?.document.write(`
      <html>
        <head><title>Form ${form.form_number}</title></head>
        <body>${form.filled_html}</body>
      </html>
    `)
    printWindow?.print()
  }

  async function downloadAllAsZip() {
    const zip = new JSZip()
    
    generatedForms.forEach(form => {
      const html = `<html><head><title>Form ${form.form_number}</title></head><body>${form.filled_html}</body></html>`
      zip.file(`Form-${form.form_number}.html`, html)
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'all-forms.zip')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-green-800">All Forms Complete!</h1>
        <p className="text-green-700 mt-2">Review your documents before final submission.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Completed Forms</h2>
        <div className="grid gap-3">
          {generatedForms.map((form) => (
            <div key={form.form_number} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <span className="font-medium">Form {form.form_number}</span>
                <span className="text-gray-500 ml-2">
                  {form.is_submitted ? '✓ Submitted' : form.is_locked ? '🔒 Locked' : '📝 Draft'}
                </span>
              </div>
              <button
                onClick={() => downloadAsPDF(form)}
                className="text-blue-600 hover:text-blue-800"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={downloadAllAsZip}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Download All (ZIP)
        </button>
        
        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit All Forms'}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Submission</h3>
            <p className="mb-4">Once submitted, all forms will be locked and cannot be edited.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleFinalSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
