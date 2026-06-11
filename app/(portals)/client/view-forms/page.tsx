'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Download, FileText, FileArchive, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface FormData {
  id: string;
  form_number: number;
  filled_html: string;
  is_submitted: boolean;
  submitted_at: string;
}

export default function ViewFormsPage() {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [consentHtml, setConsentHtml] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if forms are submitted
    const { data: flowState } = await supabase
      .from('client_flow_state')
      .select('step_6_completed')
      .eq('client_id', user.id)
      .single();

    if (!flowState?.step_6_completed) {
      router.push('/client/dashboard');
      return;
    }

    // Load consent form
    const { data: consent } = await supabase
      .from('client_consent')
      .select('typed_name, consented_at')
      .eq('client_id', user.id)
      .single();

    if (consent) {
      setConsentHtml(`
        <div class="consent-form">
          <h1>Consent Declaration</h1>
          <p>Signed by: <strong>${consent.typed_name}</strong></p>
          <p>Date: ${new Date(consent.consented_at).toLocaleString()}</p>
          <p>Status: Consented ✓</p>
        </div>
      `);
    }

    // Load generated forms
    const { data: generatedForms } = await supabase
      .from('generated_forms')
      .select('id, form_number, filled_html, is_submitted, submitted_at')
      .eq('user_id', user.id)
      .order('form_number', { ascending: true });

    if (generatedForms) {
      setForms(generatedForms);
    }

    setLoading(false);
  };

  const handleViewForm = (form: FormData) => {
    setSelectedForm(form);
  };

  const downloadPDF = async (html: string, filename: string) => {
    // This would integrate with a PDF generation library
    // For now, open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadDOCX = async (html: string, filename: string) => {
    // This would convert HTML to DOCX
    // For now, download as HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZIP = async () => {
    // This would create a ZIP file with all forms
    alert('ZIP download will be available soon. This will bundle all forms into a single ZIP file.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Form {selectedForm.form_number}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedForm(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to List
                </button>
                <button
                  onClick={() => downloadPDF(selectedForm.filled_html, `Form-${selectedForm.form_number}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> PDF
                </button>
                <button
                  onClick={() => downloadDOCX(selectedForm.filled_html, `Form-${selectedForm.form_number}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> DOCX
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: selectedForm.filled_html }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">My Submitted Forms</h1>
            <p className="text-blue-100 mt-1">View and download all your completed forms</p>
          </div>

          <div className="p-6">
            {/* Download All Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={downloadAllAsZIP}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <FileArchive className="h-4 w-4" /> Download All as ZIP
              </button>
            </div>

            {/* Forms List */}
            <div className="space-y-3">
              {/* Consent Form */}
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-lg">Consent Declaration</span>
                    <p className="text-sm text-gray-500">Signed and consented</p>
                  </div>
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow && consentHtml) {
                        printWindow.document.write(consentHtml);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> View
                  </button>
                </div>
              </div>

              {/* Form 01 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-lg">Form-01: Application Form</span>
                    <p className="text-sm text-gray-500">Master application form</p>
                  </div>
                  <button
                    onClick={() => {
                      const form = forms.find(f => f.form_number === 1);
                      if (form) handleViewForm(form);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> View
                  </button>
                </div>
              </div>

              {/* Forms 02-17 */}
              {forms.filter(f => f.form_number >= 2 && f.form_number <= 17).map((form) => (
                <div key={form.form_number} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-lg">Form-{String(form.form_number).padStart(2, '0')}</span>
                      <p className="text-sm text-gray-500">Submitted on {new Date(form.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleViewForm(form)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
