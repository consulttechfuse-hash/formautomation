'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface ViewForm01DataProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

export default function ViewForm01Data({ clientId, clientName, onClose }: ViewForm01DataProps) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    loadFormData();
  }, [clientId]);

  const loadFormData = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', clientId)
      .single();

    if (error) {
      console.error('Error loading form data:', error);
    } else {
      setFormData(data);
    }
    
    setLoading(false);
  };

  const sections = [
    { id: 'all', name: 'All Fields' },
    { id: 'n1_1', name: 'N1.1 - Names' },
    { id: 'n1_2', name: 'N1.2 - Children' },
    { id: 'n1_3', name: 'N1.3 - Contact' },
    { id: 'n1_4_1', name: 'N1.4.1 - Father' },
    { id: 'n1_4_2', name: 'N1.4.2 - Mother' },
    { id: 'n1_5', name: 'N1.5 - Addresses' },
    { id: 'n1_6', name: 'N1.6 - Genders' },
    { id: 'n1_7', name: 'N1.7 - Dates' },
    { id: 'n1_8', name: 'N1.8 - Witnesses' },
    { id: 'n1_9', name: 'N1.9 - Offices' }
  ];

  const getSectionFields = () => {
    if (!formData) return [];
    
    const allFields = Object.entries(formData).filter(([key]) => 
      !['id', 'user_id', 'user_email', 'created_at', 'updated_at'].includes(key)
    );
    
    if (activeSection === 'all') return allFields;
    
    const sectionPrefixes: Record<string, string[]> = {
      n1_1: ['fn_', 'srn_', 'mdn_', 'bsrn_', 'mr1_', 'fln_', 'fni_', 'srni_', 'mdni_'],
      n1_2: ['chld'],
      n1_3: ['ema_', 'cnt_'],
      n1_4_1: ['pffn_', 'pfbt_', 'pfbp_'],
      n1_4_2: ['pmfn_', 'pmbd_', 'pmbp_', 'pmp_', 'pmfn_t3_1'],
      n1_5: ['strn_', 'sbn_', 'aptn_', 'ctn_', 'dstr_', 'spn_', 'ctr_', 'ptc_', 'cadr_', 'adr_stack'],
      n1_6: ['gen_', 'she_', 'bgr_', 'his_'],
      n1_7: ['bdate_', 'dis_', 'dtn_', 'dil_', 'dal_', '21st_'],
      n1_8: ['wtn'],
      n1_9: ['pno_']
    };
    
    const prefixes = sectionPrefixes[activeSection] || [];
    return allFields.filter(([key]) => 
      prefixes.some(prefix => key.startsWith(prefix))
    );
  };

  const formatFieldName = (key: string) => {
    // Convert dev_name to readable label
    const labels: Record<string, string> = {
      fn_t1: 'First Name',
      fn_t2: 'First Name Uppercase',
      fn_t3: 'First Name Lowercase',
      fni_t1: 'First Name Initial Lowercase',
      fni_t2: 'First Name Initial Uppercase',
      srn_t1: 'Surname',
      srn_t2: 'Surname Uppercase',
      srn_t3: 'Surname Lowercase',
      srni_t1: 'Surname Initial Lowercase',
      srni_t2: 'Surname Initial Uppercase',
      mdn_t1: 'Middle Name',
      mdn_t2: 'Middle Name Uppercase',
      mdn_t3: 'Middle Name Lowercase',
      mdni_t1: 'Middle Name Initials',
      bsrn_t1: 'Surname at Birth',
      bsrn_t2: 'Surname at Birth Uppercase',
      bsrn_t3: 'Surname at Birth Lowercase',
      mr1_t1: 'Married Surname',
      mr1_t2: 'Married Surname Uppercase',
      mr1_t3: 'Married Surname Lowercase',
      fln_t1: 'Full Names',
      fln_t2: 'Full Names Uppercase',
      fln_t5: 'First + Middle Initial + Last',
      fln_t8: 'First+Middle Init+Last Uppercase',
      fln_t10: 'Initials+Last Uppercase',
      ema_t1: 'Email Address',
      cnt_1: 'Mobile Number',
      pffn_t1: 'Father\'s Full Name',
      pfbt_t2: 'Father\'s Birth Day',
      pfbt_t3: 'Father\'s Birth Month',
      pfbt_t4: 'Father\'s Birth Year',
      pfbp_t1: 'Father\'s Birth Town/City',
      pfbp_t2: 'Father\'s Birth District',
      pfbp_t3: 'Father\'s Birth Province',
      pfbp_t4: 'Father\'s Birth Country',
      pmfn_t1: 'Mother\'s Full Name',
      pmfn_t3_1: 'Mother\'s Maiden Surname',
      pmbd_t2: 'Mother\'s Birth Day',
      pmbd_t3: 'Mother\'s Birth Month',
      pmbd_t4: 'Mother\'s Birth Year',
      pmbp_t1: 'Mother\'s Birth Town/City',
      pmbp_t2: 'Mother\'s Birth District',
      pmbp_t3: 'Mother\'s Birth Province',
      pmbp_t4: 'Mother\'s Birth Country',
      strn_t1: 'Street Name',
      sbn_t1: 'Suburb',
      aptn_t1: 'Apartment',
      ctn_t1: 'City/Town',
      dstr_t1: 'District',
      spn_t1: 'Province',
      ctr_t1: 'Country',
      ptc_t1: 'Postal Code',
      cadr_t1: 'Full Address',
      adr_stack: 'Stacked Address',
      gen_t1: 'Gender',
      she_t1: 'Pronoun',
      bgr_t1: 'Reference',
      his_t1: 'Possessive',
      bdate_t1: 'Birth Day',
      bdate_t2: 'Birth Month',
      bdate_t3: 'Birth Year',
      bdate_t4: 'Birth Country',
      dis_t1: 'Date ISO Short Slash',
      dis_t2: 'Date ISO Short Dash',
      dis_t3: 'Date ISO Short Comma',
      dtn_t1: 'Date ANSI Short Slash',
      dtn_t2: 'Date ANSI Short Dash',
      dtn_t3: 'Date ANSI Short Comma',
      dil_t1: 'Date ISO Long',
      dal_t1: 'Date ANSI Long',
      '21st_t1': '21st Birth Day',
      '21st_t2': '21st Birth Month',
      '21st_t3': '21st Birth Year',
      '21st_t4': '21st Birthday',
      pno_t1: 'Office of the Master',
      pno_t2: 'Office of Home Affairs',
      pno_t3: 'Office of SARS',
      pno_t4: 'Office of Finance'
    };
    
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (value.length > 100) return value.substring(0, 100) + '...';
    return value;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const sectionFields = getSectionFields();
  const visibleFields = sectionFields.filter(([_, value]) => value !== null && value !== '' && value !== undefined);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Form-01 Data</h2>
            <p className="text-blue-100 text-sm">Client: {clientName}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="border-b px-4 pt-2 overflow-x-auto">
          <div className="flex gap-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {visibleFields.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No data found for this section
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleFields.map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {formatFieldName(key)}
                  </label>
                  <div className="mt-1 text-sm text-gray-900 break-words">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Export as JSON
              const dataStr = JSON.stringify(formData, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `form01_${clientName.replace(/\s/g, '_')}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}
