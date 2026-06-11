'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';

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
  const [consentHtml, setConsentHtml] = useState<string>('');
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
    
    // Load Form-01 data (ALL fields including hidden)
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
    
    // Generate full consent HTML
    if (consent) {
      generateConsentHtml(consent);
    }

    setLoading(false);
  };

  const generateConsentHtml = (consent: any) => {
    const html = `
      <div class="max-w-3xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="bg-green-600 px-6 py-4">
            <h1 class="text-2xl font-bold text-white">Consent Declaration</h1>
            <p class="text-green-100 text-sm">Signed and consented on ${new Date(consent.consented_at).toLocaleString()}</p>
          </div>
          <div class="p-6">
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 class="font-semibold mb-2">Consent Information</h3>
              <table class="w-full">
                <tr><td class="py-2 text-gray-600 w-1/3">Signed by:</td><td class="py-2 font-medium">${consent.typed_name || 'N/A'}</td></tr>
                <tr><td class="py-2 text-gray-600">Consented at:</td><td class="py-2 font-medium">${new Date(consent.consented_at).toLocaleString()}</td></tr>
                <tr><td class="py-2 text-gray-600">IP Address:</td><td class="py-2 font-medium">${consent.ip_address || 'N/A'}</td></tr>
                <tr><td class="py-2 text-gray-600">Status:</td><td class="py-2 font-medium text-green-600">✓ Consented</td></tr>
              </table>
            </div>
            <div class="border rounded-lg p-6 max-h-96 overflow-y-auto bg-white">
              <div class="whitespace-pre-wrap">${consent.consent_text || 'Consent declaration agreed'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    setConsentHtml(html);
  };

  const loadSelectedContent = () => {
    if (selectedTab === 'consent') {
      setSelectedFormHtml(consentHtml);
    } else if (selectedTab === 'form01') {
      loadForm01Content();
    } else {
      const formNumber = parseInt(selectedTab.replace('form', ''));
      const form = generatedForms.find(f => f.form_number === formNumber);
      if (form?.filled_html) {
        // Replace any remaining placeholders with actual data
        let html = form.filled_html;
        if (form01Data) {
          // Replace placeholders like {{fn_t2}} with actual values
          const placeholders = html.match(/{{(.*?)}}/g) || [];
          for (const placeholder of placeholders) {
            const fieldName = placeholder.replace(/[{}]/g, '');
            const value = form01Data[fieldName];
            if (value) {
              html = html.replace(new RegExp(`{{${fieldName}}}`, 'g'), value);
            } else {
              html = html.replace(new RegExp(`{{${fieldName}}}`, 'g'), '<span class="text-gray-400">[Not provided]</span>');
            }
          }
        }
        setSelectedFormHtml(html);
      } else {
        setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Form not yet started.</div>');
      }
    }
  };

  const loadForm01Content = () => {
    if (!form01Data) {
      setSelectedFormHtml('<div class="text-center py-12 text-gray-500">Form-01 not started yet.</div>');
      return;
    }

    // Complete field list from Excel - ALL fields organized by section
    const sections = [
      { title: 'N1.1 — National Naming Information (Input Fields)', fields: [
        { name: 'fn_t1', label: 'First Name - Normal Case', visible: true },
        { name: 'mdn_t1', label: 'Middle Name - Normal Case', visible: true },
        { name: 'srn_t1', label: 'Surname - Normal Case', visible: true },
        { name: 'bsrn_t1', label: 'Surname at Birth - Normal Case', visible: true },
        { name: 'mr1_t1', label: 'Current Married Surname - Normal', visible: true }
      ]},
      { title: 'N1.1 — Auto-Complete Fields (Hidden - Auto-Calculated)', fields: [
        { name: 'fn_t2', label: 'First Name - Uppercase', visible: false },
        { name: 'fn_t3', label: 'First Name - Lowercase', visible: false },
        { name: 'fni_t1', label: 'First Name Initial - Lowercase', visible: false },
        { name: 'fni_t2', label: 'First Name Initial - Uppercase', visible: false },
        { name: 'mdn_t2', label: 'Middle Name - Uppercase', visible: false },
        { name: 'mdn_t3', label: 'Middle Name - Lowercase', visible: false },
        { name: 'mdni_t1', label: 'Middle Name Initials - Lowercase', visible: false },
        { name: 'mdni2_t2', label: 'Middle Name Initials - Uppercase', visible: false },
        { name: 'srn_t2', label: 'Surname - Uppercase', visible: false },
        { name: 'srn_t3', label: 'Surname - Lowercase', visible: false },
        { name: 'srni_t1', label: 'Surname Initial - Lowercase', visible: false },
        { name: 'srni_t2', label: 'Surname Initial - Uppercase', visible: false },
        { name: 'bsrn_t2', label: 'Surname at Birth - Uppercase', visible: false },
        { name: 'bsrn_t3', label: 'Surname at Birth - Lowercase', visible: false },
        { name: 'mr1_t2', label: 'Married Surname - Uppercase', visible: false },
        { name: 'mr1_t3', label: 'Married Surname - Lowercase', visible: false }
      ]},
      { title: 'N1.1.1 — National Name Formats (Auto-Calculated)', fields: [
        { name: 'fln_t1', label: 'Full Names - Normal Case', visible: false },
        { name: 'fln_t2', label: 'Full Names - Uppercase', visible: false },
        { name: 'fln_t3', label: 'Full Names - Lowercase', visible: false },
        { name: 'fln_t4', label: 'First Name Last Name - Normal', visible: false },
        { name: 'fln_t5', label: 'First Name + Initial + Last - Normal', visible: false },
        { name: 'fln_t6', label: 'Initials + Surname - Normal', visible: false },
        { name: 'fln_t7', label: 'First & Surname - Uppercase', visible: false },
        { name: 'fln_t8', label: 'First + Middle Initials + Last - Uppercase', visible: false },
        { name: 'fln_t10', label: 'Initials + Surname - Uppercase', visible: false },
        { name: 'fln_t11', label: 'Surname, First, Middle - Normal', visible: false },
        { name: 'flnline_t1', label: 'All Names - In Line', visible: false },
        { name: 'flnstk_t1', label: 'All Names - Stacked', visible: false }
      ]},
      { title: 'N1.2 — Children', fields: [
        { name: 'chld1_t1', label: 'Child 1 Full Name', visible: true },
        { name: 'chld1_id', label: 'Child 1 ID/Passport', visible: true },
        { name: 'chld2_t1', label: 'Child 2 Full Name', visible: true },
        { name: 'chld2_id', label: 'Child 2 ID/Passport', visible: true },
        { name: 'chld3_t1', label: 'Child 3 Full Name', visible: true },
        { name: 'chld3_id', label: 'Child 3 ID/Passport', visible: true },
        { name: 'chld4_t1', label: 'Child 4 Full Name', visible: true },
        { name: 'chld4_id', label: 'Child 4 ID/Passport', visible: true },
        { name: 'chld5_t1', label: 'Child 5 Full Name', visible: true },
        { name: 'chld5_id', label: 'Child 5 ID/Passport', visible: true },
        { name: 'chld6_t1', label: 'Child 6 Full Name', visible: true },
        { name: 'chld6_id', label: 'Child 6 ID/Passport', visible: true },
        { name: 'chld7_t1', label: 'Child 7 Full Name', visible: true },
        { name: 'chld7_id', label: 'Child 7 ID/Passport', visible: true },
        { name: 'no_children', label: 'No Children (checkbox)', visible: true }
      ]},
      { title: 'N1.3 — Contact Information', fields: [
        { name: 'ema_t1', label: 'Email Address', visible: true },
        { name: 'ema_t3', label: 'Email - Uppercase', visible: false },
        { name: 'cnt_1', label: 'Mobile Number', visible: true }
      ]},
      { title: 'N1.4.1 — Father\'s Details', fields: [
        { name: 'pffn_t1', label: 'Father\'s Full Name - Normal', visible: true },
        { name: 'pffn_t2', label: 'Father\'s Full Name - Uppercase', visible: false },
        { name: 'pffn_t3', label: 'Father\'s Full Name - Lowercase', visible: false },
        { name: 'pfbt_t2', label: 'Father\'s Birth Day', visible: true },
        { name: 'pfbt_t3', label: 'Father\'s Birth Month', visible: true },
        { name: 'pfbt_t4', label: 'Father\'s Birth Year', visible: true },
        { name: 'pfbp_t1', label: 'Father\'s Birth Place - Town/City', visible: true },
        { name: 'pfbp_t2', label: 'Father\'s Birth Place - District', visible: true },
        { name: 'pfbp_t3', label: 'Father\'s Birth Place - Province', visible: true },
        { name: 'pfbp_t4', label: 'Father\'s Birth Place - Country', visible: true },
        { name: 'pfbt_t1', label: 'Father\'s Birth Date Long ETSI', visible: false },
        { name: 'pfbt_t1_1', label: 'Father\'s Birth Date Long ANSI', visible: false },
        { name: 'pfbt_t1_2', label: 'Father\'s Birth Date Short ETSI', visible: false },
        { name: 'pfbt_t1_3', label: 'Father\'s Birth Date Short ANSI', visible: false }
      ]},
      { title: 'N1.4.2 — Mother\'s Details', fields: [
        { name: 'pmfn_t1', label: 'Mother\'s Full Name - Normal', visible: true },
        { name: 'pmfn_t2', label: 'Mother\'s Full Name - Uppercase', visible: false },
        { name: 'pmfn_t3', label: 'Mother\'s Full Name - Lowercase', visible: false },
        { name: 'pmfn_t3_1', label: 'Mother\'s Maiden Surname', visible: true },
        { name: 'pmbd_t2', label: 'Mother\'s Birth Day', visible: true },
        { name: 'pmbd_t3', label: 'Mother\'s Birth Month', visible: true },
        { name: 'pmbd_t4', label: 'Mother\'s Birth Year', visible: true },
        { name: 'pmbp_t1', label: 'Mother\'s Birth Place - Town/City', visible: true },
        { name: 'pmbp_t2', label: 'Mother\'s Birth Place - District', visible: true },
        { name: 'pmbp_t3', label: 'Mother\'s Birth Place - Province', visible: true },
        { name: 'pmbp_t4', label: 'Mother\'s Birth Place - Country', visible: true },
        { name: 'pmp_t1', label: 'Parents Marriage Place - Suburb', visible: true },
        { name: 'pmp_t2', label: 'Parents Marriage Place - Town/City', visible: true },
        { name: 'pmp_t3', label: 'Parents Marriage Place - District', visible: true },
        { name: 'pmp_t4', label: 'Parents Marriage Place - Province', visible: true },
        { name: 'pmp_t5', label: 'Parents Marriage Place - Country', visible: true },
        { name: 'pfadr_1', label: 'Parents/Family Full Address', visible: true }
      ]},
      { title: 'N1.5 — Addresses', fields: [
        { name: 'strn_t1', label: 'Street Name - Normal', visible: true },
        { name: 'strn_t2', label: 'Street Name - Uppercase', visible: false },
        { name: 'sbn_t1', label: 'Suburb Name - Normal', visible: true },
        { name: 'sbn_t2', label: 'Suburb Name - Uppercase', visible: false },
        { name: 'sbn_t3', label: 'Suburb Name - Lowercase', visible: false },
        { name: 'aptn_t1', label: 'Apartment Name - Normal', visible: true },
        { name: 'aptn_t2', label: 'Apartment Name - Uppercase', visible: false },
        { name: 'aptn_t3', label: 'Apartment Name - Lowercase', visible: false },
        { name: 'ctn_t1', label: 'City/Town Name - Normal', visible: true },
        { name: 'ctn_t2', label: 'City/Town Name - Uppercase', visible: false },
        { name: 'ctn_t3', label: 'City/Town Name - Lowercase', visible: false },
        { name: 'dstr_t1', label: 'District Name - Normal', visible: true },
        { name: 'dstr_t2', label: 'District Name - Uppercase', visible: false },
        { name: 'dstr_t3', label: 'District Name - Lowercase', visible: false },
        { name: 'spn_t1', label: 'State/Province - Normal', visible: true },
        { name: 'spn_t2', label: 'State/Province - Uppercase', visible: false },
        { name: 'spn_t3', label: 'State/Province - Lowercase', visible: false },
        { name: 'ctr_t1', label: 'Country Name - Normal', visible: true },
        { name: 'ctr_t2', label: 'Country Name - Uppercase', visible: false },
        { name: 'ctr_t3', label: 'Country Name - Lowercase', visible: false },
        { name: 'ptc_t1', label: 'Postal Code', visible: true },
        { name: 'cadr_t1', label: 'Full Address - Normal', visible: false },
        { name: 'cadr_t2', label: 'Full Address - Uppercase', visible: false },
        { name: 'cadr_t3', label: 'Full Address - Lowercase', visible: false },
        { name: 'adr_stack', label: 'Stacked Address', visible: false }
      ]},
      { title: 'N1.6 — Genders', fields: [
        { name: 'gen_t1', label: 'Gender Type', visible: true },
        { name: 'gen_t2', label: 'Gender Type - Uppercase', visible: false },
        { name: 'she_t1', label: 'Pronoun', visible: true },
        { name: 'she_t2', label: 'Pronoun - Uppercase', visible: false },
        { name: 'bgr_t1', label: 'Reference', visible: true },
        { name: 'bgr_t2', label: 'Reference - Uppercase', visible: false },
        { name: 'his_t1', label: 'Possessive', visible: true },
        { name: 'his_t2', label: 'Possessive - Uppercase', visible: false }
      ]},
      { title: 'N1.7 — National Dates', fields: [
        { name: 'bdate_t1', label: 'Birth Day', visible: true },
        { name: 'bdate_t2', label: 'Birth Month', visible: true },
        { name: 'bdate_t2_1', label: 'Birth Month Name', visible: false },
        { name: 'bdate_t3', label: 'Birth Year', visible: true },
        { name: 'bdate_t4', label: 'Birth Country', visible: true },
        { name: 'dis_t1', label: 'Date ISO Short (YYYY/MM/DD)', visible: false },
        { name: 'dis_t2', label: 'Date ISO Short (YYYY-MM-DD)', visible: false },
        { name: 'dis_t3', label: 'Date ISO Short (DD MM, YYYY)', visible: false },
        { name: 'dtn_t1', label: 'Date ANSI Short (MM/DD/YYYY)', visible: false },
        { name: 'dtn_t2', label: 'Date ANSI Short (MM-DD-YYYY)', visible: false },
        { name: 'dtn_t3', label: 'Date ANSI Short (MM DD, YYYY)', visible: false },
        { name: 'dil_t1', label: 'Date ISO Long', visible: false },
        { name: 'dil_t2', label: 'Date ISO Long (Uppercase Month)', visible: false },
        { name: 'dal_t1', label: 'Date ANSI Long', visible: false },
        { name: '21st_t1', label: '21st Birth Day', visible: false },
        { name: '21st_t2', label: '21st Birth Month', visible: false },
        { name: '21st_t3', label: '21st Birth Year', visible: false },
        { name: '21st_t4', label: '21st Birthday', visible: false }
      ]},
      { title: 'N1.8 — Witnesses', fields: [
        { name: 'wtn1_t1', label: 'Witness 1 - Full Name', visible: true },
        { name: 'wtn1_t2', label: 'Witness 1 - Address', visible: true },
        { name: 'wtn1_t3', label: 'Witness 1 - Email', visible: true },
        { name: 'wtn1_t4', label: 'Witness 1 - Phone', visible: true },
        { name: 'wtn1_t5', label: 'Witness 1 - Country', visible: true },
        { name: 'wtn1_t6', label: 'Witness 1 - Corroboration', visible: true },
        { name: 'wtn2_t1', label: 'Witness 2 - Full Name', visible: true },
        { name: 'wtn2_t2', label: 'Witness 2 - Address', visible: true },
        { name: 'wtn2_t3', label: 'Witness 2 - Email', visible: true },
        { name: 'wtn2_t4', label: 'Witness 2 - Phone', visible: true },
        { name: 'wtn2_t5', label: 'Witness 2 - Country', visible: true },
        { name: 'wtn2_t6', label: 'Witness 2 - Corroboration', visible: true },
        { name: 'wtn3_t1', label: 'Witness 3 - Full Name', visible: true },
        { name: 'wtn3_t2', label: 'Witness 3 - Address', visible: true },
        { name: 'wtn3_t3', label: 'Witness 3 - Email', visible: true },
        { name: 'wtn3_t4', label: 'Witness 3 - Phone', visible: true },
        { name: 'wtn3_t5', label: 'Witness 3 - Country', visible: true },
        { name: 'wtn3_t6', label: 'Witness 3 - Corroboration', visible: true }
      ]},
      { title: 'N1.9 — Principal Notice Offices', fields: [
        { name: 'pno_t1', label: 'Office of the Master', visible: true },
        { name: 'pno_t2', label: 'Office of Home Affairs', visible: true },
        { name: 'pno_t3', label: 'Office of SARS Commissioner', visible: true },
        { name: 'pno_t4', label: 'Office of the Minister of Finance', visible: true }
      ]}
    ];

    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === '') {
        return '<span class="text-gray-400 italic">— not provided —</span>';
      }
      if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    let html = `
      <div class="form01-view">
        <div class="bg-blue-600 text-white px-4 py-3 rounded-t-lg mb-4">
          <h2 class="font-semibold">Form-01: Master Application Form</h2>
          <p class="text-sm text-blue-100">Client ID: ${clientId.substring(0, 8)}... | Completed: ${form01Data.updated_at ? new Date(form01Data.updated_at).toLocaleString() : 'N/A'}</p>
        </div>
    `;

    for (const section of sections) {
      // Only show section if any field has data (including hidden auto-calculated)
      const hasData = section.fields.some(f => form01Data[f.name] !== null && form01Data[f.name] !== undefined && form01Data[f.name] !== '');
      
      if (hasData) {
        html += `
          <div class="mb-6 border rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-2 font-semibold text-gray-800">${section.title}</div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <tbody>
        `;
        
        for (const field of section.fields) {
          const value = form01Data[field.name];
          const displayValue = formatValue(value);
          const visibilityBadge = !field.visible ? '<span class="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">(hidden)</span>' : '';
          
          html += `
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-2 w-1/3">
                <span class="font-mono text-xs text-gray-500">${field.name}</span>
                ${visibilityBadge}
                <div class="text-sm text-gray-700">${field.label}</div>
              </td>
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
    }

    html += `</div>`;
    setSelectedFormHtml(html);
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

        {/* Content - Full view like user sees */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div dangerouslySetInnerHTML={{ __html: selectedFormHtml }} />
        </div>

        {/* Footer - Close only, no downloads */}
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
