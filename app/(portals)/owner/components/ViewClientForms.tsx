'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Download, FileText, FileArchive } from 'lucide-react';

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
  const [consentData, setConsentData] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<string>('consent');
  const [selectedFormHtml, setSelectedFormHtml] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    loadAllData();
  }, [clientId]);

  useEffect(() => {
    if (!loading) {
      loadSelectedContent();
    }
  }, [selectedTab, loading]);

  const loadAllData = async () => {
    setLoading(true);
    
    // Load Form-01 data
    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', clientId)
      .single();
    setForm01Data(form01 || null);

    // Load Generated Forms (02-17)
    const { data: forms } = await supabase
      .from('generated_forms')
      .select('*')
      .eq('user_id', clientId)
      .order('form_number', { ascending: true });
    setGeneratedForms(forms || []);

    // Load Consent data
    const { data: consent } = await supabase
      .from('client_consent')
      .select('*')
      .eq('client_id', clientId)
      .single();
    setConsentData(consent || null);

    setLoading(false);
  };

  const loadSelectedContent = async () => {
    if (selectedTab === 'consent') {
      loadConsentContent();
    } else if (selectedTab === 'form01') {
      loadForm01Content();
    } else {
      const formNumber = parseInt(selectedTab.replace('form', ''));
      const form = generatedForms.find(f => f.form_number === formNumber);
      if (form?.filled_html) {
        setSelectedFormHtml(form.filled_html);
      } else {
        setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Form not yet completed.</div>');
      }
    }
  };

  const loadConsentContent = () => {
    if (!consentData) {
      setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Consent form not completed yet.</div>');
      return;
    }
    
    setSelectedFormHtml(`
      <div class="max-w-3xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="bg-green-600 px-6 py-4">
            <h1 class="text-2xl font-bold text-white">Consent Declaration</h1>
          </div>
          <div class="p-6">
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 class="font-semibold mb-2">Consent Information</h3>
              <table class="w-full">
                <tr><td class="py-2 text-gray-600">Signed by:</td><td class="py-2 font-medium">${consentData.typed_name || 'N/A'}</td></tr>
                <tr><td class="py-2 text-gray-600">Consented at:</td><td class="py-2 font-medium">${new Date(consentData.consented_at).toLocaleString()}</td></tr>
                <tr><td class="py-2 text-gray-600">Status:</td><td class="py-2 font-medium text-green-600">✓ Consented</td></tr>
              </table>
            </div>
            <div class="border rounded-lg p-6 max-h-96 overflow-y-auto">
              <div class="whitespace-pre-wrap">${consentData.consent_text || 'Consent declaration agreed'}</div>
            </div>
          </div>
        </div>
      </div>
    `);
  };

  const loadForm01Content = () => {
    if (!form01Data) {
      setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Form-01 not completed yet.</div>');
      return;
    }

    // All fields organized by section - showing EVERY field including empty ones
    const sections = [
      { title: 'N1.1 — National Naming Information (Input Fields)', fields: ['fn_t1', 'mdn_t1', 'srn_t1', 'bsrn_t1', 'mr1_t1'] },
      { title: 'N1.1 — Auto-Complete Fields (Hidden)', fields: ['fn_t2', 'fn_t3', 'fni_t1', 'fni_t2', 'srn_t2', 'srn_t3', 'srni_t1', 'srni_t2', 'mdn_t2', 'mdn_t3', 'mdni_t1', 'bsrn_t2', 'bsrn_t3', 'mr1_t2', 'mr1_t3'] },
      { title: 'N1.1.1 — Name Formats', fields: ['fln_t1', 'fln_t2', 'fln_t3', 'fln_t4', 'fln_t5', 'fln_t6', 'fln_t7', 'fln_t8', 'fln_t10', 'fln_t11', 'flnline_t1', 'flnstk_t1'] },
      { title: 'N1.2 — Children', fields: ['chld1_t1', 'chld1_id', 'chld2_t1', 'chld2_id', 'chld3_t1', 'chld3_id', 'chld4_t1', 'chld4_id', 'chld5_t1', 'chld5_id', 'chld6_t1', 'chld6_id', 'chld7_t1', 'chld7_id'] },
      { title: 'N1.3 — Contact Information', fields: ['ema_t1', 'ema_t3', 'cnt_1'] },
      { title: 'N1.4.1 — Father\'s Details', fields: ['pffn_t1', 'pffn_t2', 'pffn_t3', 'pfbt_t1', 'pfbt_t1_1', 'pfbt_t1_2', 'pfbt_t1_3', 'pfbt_t2', 'pfbt_t3', 'pfbt_t3_1', 'pfbt_t4', 'pfbp_t1', 'pfbp_t2', 'pfbp_t3', 'pfbp_t4'] },
      { title: 'N1.4.2 — Mother\'s Details', fields: ['pmfn_t1', 'pmfn_t2', 'pmfn_t3', 'pmfn_t3_1', 'pmbd_t1', 'pmbd_t2', 'pmbd_t3', 'pmbd_t4', 'pmbd_t4_1', 'pmbd_t4_2', 'pmbd_t4_3', 'pmbd_t4_4', 'pmbp_t1', 'pmbp_t2', 'pmbp_t3', 'pmbp_t4', 'pmp_t1', 'pmp_t2', 'pmp_t3', 'pmp_t4', 'pmp_t5', 'pfadr_1', 'psdc_t1', 'idp_t1'] },
      { title: 'N1.5 — Addresses (Input)', fields: ['strn_t1', 'sbn_t1', 'aptn_t1', 'ctn_t1', 'dstr_t1', 'spn_t1', 'ctr_t1', 'ptc_t1'] },
      { title: 'N1.5 — Addresses (Auto-Complete)', fields: ['strn_t2', 'sbn_t2', 'sbn_t3', 'aptn_t2', 'aptn_t3', 'ctn_t2', 'ctn_t3', 'dstr_t2', 'dstr_t3', 'spn_t2', 'spn_t3', 'ctr_t2', 'ctr_t3', 'cadr_t1', 'cadr_t2', 'cadr_t3', 'adr_stack'] },
      { title: 'N1.6 — Genders', fields: ['gen_t1', 'gen_t2', 'she_t1', 'she_t2', 'bgr_t1', 'bgr_t2', 'his_t1', 'his_t2'] },
      { title: 'N1.7 — National Dates', fields: ['bdate_t1', 'bdate_t2', 'bdate_t2_1', 'bdate_t3', 'bdate_t4', 'dis_t1', 'dis_t2', 'dis_t3', 'dtn_t1', 'dtn_t2', 'dtn_t3', 'dil_t1', 'dil_t2', 'dil_t3', 'dal_t1', 'dal_t2', '21st_t1', '21st_t2', '21st_t3', '21st_t4'] },
      { title: 'N1.8 — Witnesses', fields: ['wtn1_t1', 'wtn1_t2', 'wtn1_t3', 'wtn1_t4', 'wtn1_t5', 'wtn1_t6', 'wtn2_t1', 'wtn2_t2', 'wtn2_t3', 'wtn2_t4', 'wtn2_t5', 'wtn2_t6', 'wtn3_t1', 'wtn3_t2', 'wtn3_t3', 'wtn3_t4', 'wtn3_t5', 'wtn3_t6'] },
      { title: 'N1.9 — Principal Notice Offices', fields: ['pno_t1', 'pno_t2', 'pno_t3', 'pno_t4'] },
      { title: 'Conditional / Control Fields', fields: ['no_middle_name', 'bsrn_not_applicable', 'mr_not_married', 'no_children'] }
    ];

    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === '') return '<span class="text-gray-400 italic">— empty —</span>';
      if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    let html = `
      <div class="form01-view">
        <div class="bg-blue-600 text-white px-4 py-2 rounded-t-lg mb-4">
          <h2 class="font-semibold">Form-01: Master Application Form</h2>
          <p class="text-sm text-blue-100">Client ID: ${clientId.substring(0, 8)}...</p>
        </div>
    `;

    for (const section of sections) {
      html += `
        <div class="mb-6 border rounded-lg overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 font-semibold text-gray-800">${section.title}</div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <tbody>
      `;
      
      for (const field of section.fields) {
        const value = form01Data[field];
        const displayValue = formatValue(value);
        html += `
          <tr class="border-b hover:bg-gray-50">
            <td class="px-4 py-2 w-1/3 font-mono text-xs text-gray-500">${field}</td>
            <td class="px-4 py-2 w-2/3 break-words">${displayValue}</td>
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

    html += `</div>`;
    setSelectedFormHtml(html);
  };

  const downloadHTML = () => {
    const title = selectedTab === 'consent' ? 'Consent' : selectedTab === 'form01' ? 'Form-01' : `Form-${selectedTab.replace('form', '')}`;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${clientName}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-gray-400 { color: #9ca3af; }
          .italic { font-style: italic; }
        </style>
      </head>
      <body>${selectedFormHtml}</body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName.replace(/\s/g, '_')}_${title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const title = selectedTab === 'consent' ? 'Consent' : selectedTab === 'form01' ? 'Form-01' : `Form-${selectedTab.replace('form', '')}`;
      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - ${clientName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              td { border: 1px solid #ddd; padding: 6px; }
            </style>
          </head>
          <body>${selectedFormHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Build tabs: Consent, Form-01, Form-02 through Form-17
  const tabs = [
    { id: 'consent', label: 'Consent' },
    { id: 'form01', label: 'Form-01' },
    ...generatedForms.map(f => ({ id: `form${f.form_number}`, label: `Form-${String(f.form_number).padStart(2, '0')}` }))
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
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

        {/* Horizontal Tabs */}
        <div className="border-b px-2 overflow-x-auto whitespace-nowrap">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div dangerouslySetInnerHTML={{ __html: selectedFormHtml }} />
        </div>

        {/* Footer with Download Buttons */}
        <div className="border-t px-6 py-3 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={downloadHTML}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" /> Download HTML
            </button>
            <button
              onClick={downloadPDF}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
            >
              <Download className="h-4 w-4" /> Print / PDF
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border rounded-lg hover:bg-gray-50 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
