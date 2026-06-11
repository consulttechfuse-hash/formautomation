'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Download, Eye, ChevronLeft, ChevronRight, FileText, FileArchive } from 'lucide-react';

interface ViewClientFormsProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

interface FormData {
  id: string;
  form_number: number;
  filled_html: string;
  is_submitted: boolean;
  submitted_at: string;
}

export default function ViewClientForms({ clientId, clientName, onClose }: ViewClientFormsProps) {
  const [loading, setLoading] = useState(true);
  const [form01Data, setForm01Data] = useState<any>(null);
  const [generatedForms, setGeneratedForms] = useState<FormData[]>([]);
  const [selectedFormNumber, setSelectedFormNumber] = useState<number>(1);
  const [selectedFormHtml, setSelectedFormHtml] = useState<string>('');
  const [consentData, setConsentData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadAllData();
  }, [clientId]);

  const loadAllData = async () => {
    setLoading(true);
    
    // Load Form-01 data (ALL fields including hidden)
    const { data: form01, error: form01Error } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', clientId)
      .single();

    if (form01Error) {
      console.error('Error loading Form-01:', form01Error);
    } else {
      setForm01Data(form01);
    }

    // Load Generated Forms (02-17)
    const { data: forms, error: formsError } = await supabase
      .from('generated_forms')
      .select('*')
      .eq('user_id', clientId)
      .order('form_number', { ascending: true });

    if (formsError) {
      console.error('Error loading forms:', formsError);
    } else {
      setGeneratedForms(forms || []);
    }

    // Load Consent data
    const { data: consent, error: consentError } = await supabase
      .from('client_consent')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (consent && !consentError) {
      setConsentData(consent);
    }

    setLoading(false);
  };

  const handleFormSelect = (formNumber: number) => {
    setSelectedFormNumber(formNumber);
    
    if (formNumber === 0) {
      // Consent form - generate HTML
      generateConsentHtml();
    } else if (formNumber === 1) {
      // Form-01 - generate HTML table view
      generateForm01Html();
    } else {
      // Forms 02-17 - get from generated_forms
      const form = generatedForms.find(f => f.form_number === formNumber);
      if (form?.filled_html) {
        setSelectedFormHtml(form.filled_html);
      } else {
        setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Form data not available. Client may not have completed this form yet.</div>');
      }
    }
  };

  const generateConsentHtml = () => {
    if (!consentData) {
      setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Consent form not completed yet.</div>');
      return;
    }
    
    const html = `
      <div class="consent-view">
        <h1 class="text-2xl font-bold text-center mb-6">Consent Declaration</h1>
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-2">Consent Information</h3>
          <table class="w-full">
            <tr><td class="py-1 text-gray-600">Signed by:</td><td class="py-1 font-medium">${consentData.typed_name || 'N/A'}</td></tr>
            <tr><td class="py-1 text-gray-600">Consented at:</td><td class="py-1 font-medium">${new Date(consentData.consented_at).toLocaleString()}</td></tr>
            <tr><td class="py-1 text-gray-600">IP Address:</td><td class="py-1 font-medium">${consentData.ip_address || 'N/A'}</td></tr>
            <tr><td class="py-1 text-gray-600">Status:</td><td class="py-1 font-medium text-green-600">Consented ✓</td></tr>
          </table>
        </div>
        <div class="border rounded-lg p-4 max-h-96 overflow-y-auto">
          <div class="whitespace-pre-wrap">${consentData.consent_text || 'Consent declaration agreed'}</div>
        </div>
      </div>
    `;
    setSelectedFormHtml(html);
  };

  const generateForm01Html = () => {
    if (!form01Data) {
      setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Form-01 data not available. Client has not completed this form yet.</div>');
      return;
    }

    // Define field categories for better organization
    const categories = [
      { name: 'N1.1 — National Naming Information', fields: ['fn_t1', 'fn_t2', 'fn_t3', 'fni_t1', 'fni_t2', 'srn_t1', 'srn_t2', 'srn_t3', 'srni_t1', 'srni_t2', 'mdn_t1', 'mdn_t2', 'mdn_t3', 'mdni_t1', 'bsrn_t1', 'bsrn_t2', 'bsrn_t3', 'mr1_t1', 'mr1_t2', 'mr1_t3'] },
      { name: 'N1.1.1 — Full Name Formats', fields: ['fln_t1', 'fln_t2', 'fln_t5', 'fln_t8', 'fln_t10'] },
      { name: 'N1.2 — Children', fields: ['chld1_t1', 'chld1_id', 'chld2_t1', 'chld2_id', 'chld3_t1', 'chld3_id'] },
      { name: 'N1.3 — Contact Information', fields: ['ema_t1', 'cnt_1'] },
      { name: 'N1.4.1 — Father\'s Details', fields: ['pffn_t1', 'pffn_t2', 'pffn_t3', 'pfbt_t2', 'pfbt_t3', 'pfbt_t4', 'pfbp_t1', 'pfbp_t2', 'pfbp_t3', 'pfbp_t4'] },
      { name: 'N1.4.2 — Mother\'s Details', fields: ['pmfn_t1', 'pmfn_t2', 'pmfn_t3', 'pmfn_t3_1', 'pmbd_t2', 'pmbd_t3', 'pmbd_t4', 'pmbp_t1', 'pmbp_t2', 'pmbp_t3', 'pmbp_t4'] },
      { name: 'N1.5 — Addresses', fields: ['strn_t1', 'sbn_t1', 'aptn_t1', 'ctn_t1', 'dstr_t1', 'spn_t1', 'ctr_t1', 'ptc_t1', 'cadr_t1', 'cadr_t3', 'adr_stack'] },
      { name: 'N1.6 — Genders', fields: ['gen_t1', 'gen_t2', 'she_t1', 'she_t2', 'bgr_t1', 'bgr_t2', 'his_t1', 'his_t2'] },
      { name: 'N1.7 — Dates', fields: ['bdate_t1', 'bdate_t2', 'bdate_t3', 'bdate_t4', 'dis_t1', 'dis_t2', 'dis_t3', 'dtn_t1', 'dtn_t2', 'dtn_t3', 'dil_t1', 'dil_t2', 'dal_t1', 'dal_t2', '21st_t1', '21st_t2', '21st_t3', '21st_t4'] },
      { name: 'N1.8 — Witnesses', fields: ['wtn1_t1', 'wtn1_t2', 'wtn1_t3', 'wtn1_t4', 'wtn1_t5', 'wtn1_t6', 'wtn2_t1', 'wtn2_t2', 'wtn2_t3', 'wtn2_t4', 'wtn2_t5', 'wtn2_t6', 'wtn3_t1', 'wtn3_t2', 'wtn3_t3', 'wtn3_t4', 'wtn3_t5', 'wtn3_t6'] },
      { name: 'N1.9 — Principal Notice Offices', fields: ['pno_t1', 'pno_t2', 'pno_t3', 'pno_t4'] },
      { name: 'Auto-Calculation Fields (Hidden)', fields: ['fn_t2', 'fn_t3', 'fni_t1', 'fni_t2', 'srn_t2', 'srn_t3', 'srni_t1', 'srni_t2', 'mdn_t2', 'mdn_t3', 'mdni_t1', 'bsrn_t2', 'bsrn_t3', 'mr1_t2', 'mr1_t3', 'fln_t2', 'fln_t3', 'cadr_t2', 'cadr_t3', 'gen_t2', 'she_t2', 'bgr_t2', 'his_t2', '21st_t2', '21st_t3', '21st_t4'] }
    ];

    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === '') return '<span class="text-gray-400">—</span>';
      if (typeof value === 'boolean') return value ? 'Yes ✓' : 'No ✗';
      if (Array.isArray(value)) return value.join(', ');
      return String(value);
    };

    let html = `
      <div class="form01-view">
        <h1 class="text-2xl font-bold text-center mb-2">Form-01: Application Form</h1>
        <p class="text-center text-gray-500 mb-6">Client ID: ${clientId.substring(0, 8)}...</p>
    `;

    for (const category of categories) {
      const visibleFields = category.fields.filter(field => form01Data[field] !== null && form01Data[field] !== undefined && form01Data[field] !== '');
      
      if (visibleFields.length > 0) {
        html += `
          <div class="mb-6 border rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-2 font-semibold">${category.name}</div>
            <div class="p-4">
              <table class="w-full text-sm">
                <tbody>
        `;
        
        for (const field of visibleFields) {
          const value = form01Data[field];
          const displayValue = formatValue(value);
          html += `
            <tr class="border-b">
              <td class="py-2 w-1/3 font-mono text-xs text-gray-500">${field}</td>
              <td class="py-2 w-2/3 break-words">${displayValue}</td>
            </tr>
          `;
        }
        
        html += `
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
    }

    html += `</div>`;
    setSelectedFormHtml(html);
  };

  const downloadHTML = () => {
    const blob = new Blob([selectedFormHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const formName = selectedFormNumber === 0 ? 'Consent' : `Form-${String(selectedFormNumber).padStart(2, '0')}`;
    a.href = url;
    a.download = `${clientName.replace(/\s/g, '_')}_${formName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // Open print dialog for PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Form-${String(selectedFormNumber).padStart(2, '0')} - ${clientName}</title></head>
          <body>${selectedFormHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadAllAsZIP = async () => {
    alert('ZIP download will bundle all forms. Coming soon.');
  };

  const availableForms = [
    { number: 0, name: 'Consent Declaration' },
    { number: 1, name: 'Form-01 (Master Form)' },
    ...generatedForms.map(f => ({ number: f.form_number, name: `Form-${String(f.form_number).padStart(2, '0')}` }))
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading forms...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Client Forms Viewer</h2>
            <p className="text-blue-100 text-sm">Client: {clientName}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Selector */}
        <div className="border-b px-4 py-3 flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2 overflow-x-auto">
            {availableForms.map(form => (
              <button
                key={form.number}
                onClick={() => handleFormSelect(form.number)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedFormNumber === form.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {form.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadHTML}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
            >
              <FileText className="h-3 w-3" /> HTML
            </button>
            <button
              onClick={downloadPDF}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
            >
              <Download className="h-3 w-3" /> PDF
            </button>
            <button
              onClick={downloadAllAsZIP}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
            >
              <FileArchive className="h-3 w-3" /> All as ZIP
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div dangerouslySetInnerHTML={{ __html: selectedFormHtml }} />
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
