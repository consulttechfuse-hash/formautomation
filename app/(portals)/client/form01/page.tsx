'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Helper functions
const toSentenceCase = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const toCapitalizeEachWord = (str: string) => {
  if (!str) return '';
  return str.split(' ').map(word => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

const toUppercase = (str: string) => str?.toUpperCase() || '';
const toLowercase = (str: string) => str?.toLowerCase() || '';

const formatPostalCode = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/[\[\]]/g, '');
  return `[${cleaned}]`;
};

const formatPhoneNumber = (str: string) => {
  if (!str) return '';
  let cleaned = str.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

const validateEmail = (email: string) => {
  // Strict email validation - only allows valid email format with @ and domain
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const countryList = [
  'South Africa', 'Namibia', 'United States', 'United Kingdom', 'Canada',
  'Australia', 'Germany', 'France', 'India', 'China', 'Brazil', 'Nigeria',
  'Kenya', 'Egypt', 'Zimbabwe', 'Botswana', 'Mozambique', 'Lesotho',
  'Eswatini', 'Other'
];

interface Form01Data {
  [key: string]: any;
  user_id?: string;
  user_email?: string;
  fn_t1?: string;
  srn_t1?: string;
  mr1_t1?: string;
  ema_t1?: string;
  cnt_1?: string;
}

export default function Form01Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Form01Data>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [childCount] = useState(1);
  const [marriedSurnameCount] = useState(1);
  const [middleNameCount] = useState(1);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  // Pre-populate Principal Notice Offices after data is loaded
  useEffect(() => {
    if (!loading && !formData.pno_t1) {
      setFormData(prev => ({
        ...prev,
        pno_t1: 'OFFICE OF THE MASTER\nMaster of the High Court Gauteng\nSALU Building\n316 Thabo Sehume St\nPretoria\n0001',
        pno_t2: 'OFFICE OF THE MINISTER OF HOME AFFAIRS\nPrivate Bag X114\nPretoria\nGauteng\n0001',
        pno_t3: 'OFFICE OF THE SARS COMMISSIONER\nPrivate Bag X923\nPretoria\n0001',
        pno_t4: 'OFFICE OF THE MINISTER OF FINANCE\nPrivate Bag X115\nPretoria\n0001'
      }));
    }
  }, [loading, formData.pno_t1]);

  const loadData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);

    const { data, error } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data && !error) {
      setFormData(data);
    } else {
      setFormData({ user_email: user.email });
    }

    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    let formattedValue = value;
    
    if (field === 'fn_t1' || field === 'srn_t1' || field === 'bsrn_t1') {
      formattedValue = toSentenceCase(value).replace(/\s/g, '');
    } else if (field === 'mr1_t1') {
      // Current Married Surname - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'mdn_t1' || field === 'mdn2_t1' || field === 'mdn3_t1' || field === 'mdn4_t1' || field === 'mdn5_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'strn_t1' || field === 'sbn_t1' || field === 'aptn_t1' || field === 'ctn_t1' || field === 'dstr_t1' || field === 'spn_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'ptc_t1') {
      formattedValue = formatPostalCode(value);
    } else if (field === 'pffn_t1' || field === 'pmfn_t1' || field === 'pmfn_t3_1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'cnt_1') {
      formattedValue = formatPhoneNumber(value);
    } else if (field === 'pfbp_t1' || field === 'pfbp_t2' || field === 'pfbp_t3' || 
               field === 'pmbp_t1' || field === 'pmbp_t2' || field === 'pmbp_t3') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('chld') && field.endsWith('_t1')) {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('wtn') && (field.endsWith('_t1') || field.endsWith('_t2'))) {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'ema_t1') {
      // Email - strip spaces and convert to lowercase
      formattedValue = value?.toLowerCase().replace(/\s/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (field === 'fn_t1') {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue,
        fn_t2: toUppercase(formattedValue),
        fn_t3: toLowercase(formattedValue),
        fni_t1: formattedValue.charAt(0)?.toLowerCase() || '',
        fni_t2: formattedValue.charAt(0)?.toUpperCase() || '',
      }));
    }
    
    if (field === 'srn_t1') {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue,
        srn_t2: toUppercase(formattedValue),
        srn_t3: toLowercase(formattedValue),
        srni_t1: formattedValue.charAt(0)?.toLowerCase() || '',
        srni_t2: formattedValue.charAt(0)?.toUpperCase() || '',
      }));
    }
    
    if (field === 'mdn_t1') {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue,
        mdn_t2: toUppercase(formattedValue),
        mdn_t3: toLowercase(formattedValue),
      }));
    }
    
    if (field === 'bsrn_t1') {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue,
        bsrn_t2: toUppercase(formattedValue),
        bsrn_t3: toLowercase(formattedValue),
      }));
    }
    
    if (field === 'mr1_t1') {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue,
        mr1_t2: toUppercase(formattedValue),
        mr1_t3: toLowercase(formattedValue),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fn_t1?.trim()) newErrors.fn_t1 = 'First Name is required';
    if (!formData.srn_t1?.trim()) newErrors.srn_t1 = 'Surname is required';
    if (!formData.ema_t1?.trim()) {
      newErrors.ema_t1 = 'Email is required';
    } else if (!validateEmail(formData.ema_t1)) {
      newErrors.ema_t1 = 'Valid email address required (e.g., name@domain.com) - no spaces or special characters allowed';
    }
    if (!formData.cnt_1?.trim()) newErrors.cnt_1 = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('form01_data')
      .upsert({
        user_id: userId,
        user_email: formData.user_email,
        updated_at: new Date().toISOString(),
        ...formData
      }, { onConflict: 'user_id' });

    if (error) {
      alert('Error saving form: ' + error.message);
      setSaving(false);
      return;
    }

    await supabase
      .from('client_flow_state')
      .update({
        step_4_form01_completed: true,
        current_step: 5,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', userId);

    router.push('/client/forms-02-17');
  };

  const isMiddleNameDisabled = formData.no_middle_name === 'Yes';
  const isBsrnDisabled = formData.bsrn_not_applicable === 'Yes';
  const isMarriedDisabled = formData.mr_not_married === 'Yes';
  const isChildrenDisabled = formData.no_children === 'Yes';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-white">Form-01: Application Form</h1>
            <p className="text-blue-100 mt-1">Complete all required fields (*)</p>
          </div>

          <div className="p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* N1.1 — National Naming Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.1 — National Naming Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.fn_t1 || ''} 
                    onChange={(e) => handleChange('fn_t1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="Single word only"
                    required 
                  />
                  {errors.fn_t1 && <p className="text-red-500 text-xs mt-1">{errors.fn_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input 
                    type="text" 
                    value={formData.mdn_t1 || ''} 
                    onChange={(e) => handleChange('mdn_t1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    disabled={isMiddleNameDisabled} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.srn_t1 || ''} 
                    onChange={(e) => handleChange('srn_t1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="Single word only"
                    required 
                  />
                  {errors.srn_t1 && <p className="text-red-500 text-xs mt-1">{errors.srn_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Married Surname</label>
                  <input 
                    type="text" 
                    value={formData.mr1_t1 || ''} 
                    onChange={(e) => handleChange('mr1_t1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="Auto-capitalizes each word"
                    disabled={isMarriedDisabled} 
                  />
                </div>
              </div>
            </div>

            {/* N1.2 — Children */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.2 — Children</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">No Children</label>
                <select value={formData.no_children || ''} onChange={(e) => handleChange('no_children', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">No</option>
                  <option value="Yes">Yes - I have no children</option>
                </select>
              </div>
              {!isChildrenDisabled && (
                <div className="border-l-4 border-blue-200 pl-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Child 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={formData.chld1_t1 || ''} onChange={(e) => handleChange('chld1_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID/Passport Number</label>
                      <input type="text" value={formData.chld1_id || ''} onChange={(e) => handleChange('chld1_id', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* N1.3 — Contact Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.3 — Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={formData.ema_t1 || ''} 
                    onChange={(e) => handleChange('ema_t1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="name@example.com"
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    required 
                  />
                  {errors.ema_t1 && <p className="text-red-500 text-xs mt-1">{errors.ema_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    value={formData.cnt_1?.replace(/[^+\d]/g, '') || ''} 
                    onChange={(e) => handleChange('cnt_1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="+27 XX XXX XXXX"
                    required 
                  />
                  {errors.cnt_1 && <p className="text-red-500 text-xs mt-1">{errors.cnt_1}</p>}
                  <p className="text-xs text-gray-500 mt-1">Auto-formats with + prefix</p>
                </div>
              </div>
            </div>

            {/* N1.5 — Addresses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.5 — Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
                  <input type="text" value={formData.strn_t1 || ''} onChange={(e) => handleChange('strn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 210 Jackson Street" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                  <input type="text" value={formData.sbn_t1 || ''} onChange={(e) => handleChange('sbn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Unit</label>
                  <input type="text" value={formData.aptn_t1 || ''} onChange={(e) => handleChange('aptn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
                  <input type="text" value={formData.ctn_t1 || ''} onChange={(e) => handleChange('ctn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input type="text" value={formData.dstr_t1 || ''} onChange={(e) => handleChange('dstr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input type="text" value={formData.spn_t1 || ''} onChange={(e) => handleChange('spn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    value={formData.ptc_t1?.replace(/[\[\]]/g, '') || ''} 
                    onChange={(e) => handleChange('ptc_t1', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="1234" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-formats to [1234]</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={formData.ctr_t1 || ''} onChange={(e) => handleChange('ctr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select Country</option>
                    {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
              <button type="button" onClick={() => router.push('/client/dashboard')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Back</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save & Continue →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
