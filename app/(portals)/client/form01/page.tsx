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
  // Remove any non-digit characters
  let cleaned = str.replace(/\D/g, '');
  // Ensure it starts with +27 for South Africa or just +
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    cleaned = '+27' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

const toSentenceCaseWitness = (str: string) => {
  if (!str) return '';
  // First letter uppercase, rest lowercase for entire sentence
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const validateEmail = (email: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const countryList = [
  'South Africa', 'Namibia', 'United States', 'United Kingdom', 'Canada',
  'Australia', 'Germany', 'France', 'India', 'China', 'Brazil', 'Nigeria',
  'Kenya', 'Egypt', 'Zimbabwe', 'Botswana', 'Mozambique', 'Lesotho',
  'Eswatini', 'Other'
];

export default function Form01Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Gender auto-population mapping
  const genderMapping = {
    man: { pronoun: 'he', reference: 'boy', possessive: 'his' },
    woman: { pronoun: 'she', reference: 'girl', possessive: 'her' }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setFormData({ 
        user_email: user.email,
        pno_t1: 'OFFICE OF THE MASTER\nMaster of the High Court Gauteng\nSALU Building\n316 Thabo Sehume St\nPretoria\n0001',
        pno_t2: 'OFFICE OF THE MINISTER OF HOME AFFAIRS\nPrivate Bag X114\nPretoria\nGauteng\n0001',
        pno_t3: 'OFFICE OF THE SARS COMMISSIONER\nPrivate Bag X923\nPretoria\n0001',
        pno_t4: 'OFFICE OF THE MINISTER OF FINANCE\nPrivate Bag X115\nPretoria\n0001'
      });
    }

    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    let formattedValue = value;
    
    // Apply formatting rules
    if (field === 'fn_t1' || field === 'srn_t1') {
      formattedValue = toSentenceCase(value).replace(/\s/g, '');
    } else if (field === 'bsrn_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'pmfn_t3_1') { // Maiden Surname - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'mr1_t1' || field === 'mdn_t1' || field === 'pffn_t1' || field === 'pmfn_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'strn_t1' || field === 'sbn_t1' || field === 'aptn_t1' || field === 'ctn_t1' || field === 'dstr_t1' || field === 'spn_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'ptc_t1') {
      formattedValue = formatPostalCode(value);
    } else if (field === 'cnt_1' || field === 'wtn1_t4' || field === 'wtn2_t4' || field === 'wtn3_t4') {
      formattedValue = formatPhoneNumber(value);
    } else if (field === 'pfbp_t1' || field === 'pfbp_t2' || field === 'pfbp_t3' || 
               field === 'pmbp_t1' || field === 'pmbp_t2' || field === 'pmbp_t3') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('chld') && field.endsWith('_t1')) {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('wtn') && (field.endsWith('_t1') || field.endsWith('_t2'))) {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('wtn') && field.endsWith('_t6')) {
      // Witness Corroboration - sentence case
      formattedValue = toSentenceCaseWitness(value);
    } else if (field === 'gen_t1') {
      formattedValue = value;
      // Auto-populate gender fields
      if (value === 'man') {
        setFormData((prev: any) => ({
          ...prev,
          gen_t1: 'man',
          she_t1: 'he',
          bgr_t1: 'boy',
          his_t1: 'his',
          she_t2: 'HE',
          bgr_t2: 'BOY',
          his_t2: 'HIS'
        }));
        return;
      } else if (value === 'woman') {
        setFormData((prev: any) => ({
          ...prev,
          gen_t1: 'woman',
          she_t1: 'she',
          bgr_t1: 'girl',
          his_t1: 'her',
          she_t2: 'SHE',
          bgr_t2: 'GIRL',
          his_t2: 'HER'
        }));
        return;
      }
    } else if (field === 'ema_t1') {
      formattedValue = value?.toLowerCase().replace(/\s/g, '');
    }
    
    setFormData((prev: any) => ({ ...prev, [field]: formattedValue }));
    
    // Auto-calculate derived fields
    if (field === 'fn_t1') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: formattedValue,
        fn_t2: toUppercase(formattedValue),
        fn_t3: toLowercase(formattedValue),
        fni_t1: formattedValue.charAt(0)?.toLowerCase() || '',
        fni_t2: formattedValue.charAt(0)?.toUpperCase() || '',
      }));
    }
    
    if (field === 'srn_t1') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: formattedValue,
        srn_t2: toUppercase(formattedValue),
        srn_t3: toLowercase(formattedValue),
        srni_t1: formattedValue.charAt(0)?.toLowerCase() || '',
        srni_t2: formattedValue.charAt(0)?.toUpperCase() || '',
      }));
    }
    
    if (field === 'mdn_t1') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: formattedValue,
        mdn_t2: toUppercase(formattedValue),
        mdn_t3: toLowercase(formattedValue),
      }));
    }
    
    if (field === 'bsrn_t1') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: formattedValue,
        bsrn_t2: toUppercase(formattedValue),
        bsrn_t3: toLowercase(formattedValue),
      }));
    }
    
    if (field === 'mr1_t1') {
      setFormData((prev: any) => ({
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
      newErrors.ema_t1 = 'Valid email address required';
    }
    if (!formData.cnt_1?.trim()) newErrors.cnt_1 = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    
    // Check if record exists
    const { data: existing } = await supabase
      .from('form01_data')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('form01_data')
        .update({
          user_email: formData.user_email,
          updated_at: new Date().toISOString(),
          ...formData
        })
        .eq('user_id', userId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('form01_data')
        .insert({
          user_id: userId,
          user_email: formData.user_email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...formData
        });
      error = insertError;
    }

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
            
            {/* SECTION N1.1 - National Naming Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.1 — National Naming Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.fn_t1 || ''} onChange={(e) => handleChange('fn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.fn_t1 && <p className="text-red-500 text-xs mt-1">{errors.fn_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input type="text" value={formData.mdn_t1 || ''} onChange={(e) => handleChange('mdn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.srn_t1 || ''} onChange={(e) => handleChange('srn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.srn_t1 && <p className="text-red-500 text-xs mt-1">{errors.srn_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Married Surname</label>
                  <input type="text" value={formData.mr1_t1 || ''} onChange={(e) => handleChange('mr1_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname at Birth</label>
                  <input type="text" value={formData.bsrn_t1 || ''} onChange={(e) => handleChange('bsrn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
            </div>

            {/* SECTION N1.2 - Children */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.2 — Children</h2>
              <div className="border-l-4 border-blue-200 pl-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Child 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label>Full Name</label><input type="text" value={formData.chld1_t1 || ''} onChange={(e) => handleChange('chld1_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                  <div><label>ID/Passport Number</label><input type="text" value={formData.chld1_id || ''} onChange={(e) => handleChange('chld1_id', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                </div>
              </div>
            </div>

            {/* SECTION N1.3 - Contact Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.3 — Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.ema_t1 || ''} onChange={(e) => handleChange('ema_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.ema_t1 && <p className="text-red-500 text-xs mt-1">{errors.ema_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.cnt_1?.replace(/\D/g, '') || ''} onChange={(e) => handleChange('cnt_1', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="0712345678" required />
                  {errors.cnt_1 && <p className="text-red-500 text-xs mt-1">{errors.cnt_1}</p>}
                  <p className="text-xs text-gray-500 mt-1">Auto-formats to +27XXXXXXXXX</p>
                </div>
              </div>
            </div>

            {/* SECTION N1.4.1 - Father's Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.4.1 — Father's Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Full Name</label>
                  <input type="text" value={formData.pffn_t1 || ''} onChange={(e) => handleChange('pffn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Day</label>
                  <select value={formData.pfbt_t2 || ''} onChange={(e) => handleChange('pfbt_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Day</option>
                    {[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Month</label>
                  <select value={formData.pfbt_t3 || ''} onChange={(e) => handleChange('pfbt_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Month</option>
                    {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Year</label>
                  <input type="number" value={formData.pfbt_t4 || ''} onChange={(e) => handleChange('pfbt_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><label>Town/City</label><input type="text" value={formData.pfbp_t1 || ''} onChange={(e) => handleChange('pfbp_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>District</label><input type="text" value={formData.pfbp_t2 || ''} onChange={(e) => handleChange('pfbp_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Province</label><input type="text" value={formData.pfbp_t3 || ''} onChange={(e) => handleChange('pfbp_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div>
                  <label>Country</label>
                  <select value={formData.pfbp_t4 || ''} onChange={(e) => handleChange('pfbp_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select Country</option>
                    {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION N1.4.2 - Mother's Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.4.2 — Mother's Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Full Name</label>
                  <input type="text" value={formData.pmfn_t1 || ''} onChange={(e) => handleChange('pmfn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maiden Surname</label>
                  <input type="text" value={formData.pmfn_t3_1 || ''} onChange={(e) => handleChange('pmfn_t3_1', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Auto-capitalizes" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div><label>Birth Day</label><select value={formData.pmbd_t2 || ''} onChange={(e) => handleChange('pmbd_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Month</label><select value={formData.pmbd_t3 || ''} onChange={(e) => handleChange('pmbd_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Month</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Year</label><input type="number" value={formData.pmbd_t4 || ''} onChange={(e) => handleChange('pmbd_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><label>Town/City</label><input type="text" value={formData.pmbp_t1 || ''} onChange={(e) => handleChange('pmbp_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>District</label><input type="text" value={formData.pmbp_t2 || ''} onChange={(e) => handleChange('pmbp_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Province</label><input type="text" value={formData.pmbp_t3 || ''} onChange={(e) => handleChange('pmbp_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div>
                  <label>Country</label>
                  <select value={formData.pmbp_t4 || ''} onChange={(e) => handleChange('pmbp_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select Country</option>
                    {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION N1.5 - Addresses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.5 — Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Street Name</label><input type="text" value={formData.strn_t1 || ''} onChange={(e) => handleChange('strn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Suburb</label><input type="text" value={formData.sbn_t1 || ''} onChange={(e) => handleChange('sbn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Apartment/Unit</label><input type="text" value={formData.aptn_t1 || ''} onChange={(e) => handleChange('aptn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>City/Town</label><input type="text" value={formData.ctn_t1 || ''} onChange={(e) => handleChange('ctn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>District</label><input type="text" value={formData.dstr_t1 || ''} onChange={(e) => handleChange('dstr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Province</label><input type="text" value={formData.spn_t1 || ''} onChange={(e) => handleChange('spn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Postal Code</label><input type="text" value={formData.ptc_t1?.replace(/[\[\]]/g, '') || ''} onChange={(e) => handleChange('ptc_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div>
                  <label>Country</label>
                  <select value={formData.ctr_t1 || ''} onChange={(e) => handleChange('ctr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select Country</option>
                    {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION N1.6 - Genders (Updated with only 2 options) */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.6 — Genders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender Type</label>
                  <select value={formData.gen_t1 || ''} onChange={(e) => handleChange('gen_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select</option>
                    <option value="man">Man</option>
                    <option value="woman">Woman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pronoun</label>
                  <input type="text" value={formData.she_t1 || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                  <p className="text-xs text-gray-400 mt-1">Auto-populated based on gender</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input type="text" value={formData.bgr_t1 || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Possessive</label>
                  <input type="text" value={formData.his_t1 || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                </div>
              </div>
            </div>

            {/* SECTION N1.7 - Birth Date */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.7 — Birth Date</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label>Birth Day</label><select value={formData.bdate_t1 || ''} onChange={(e) => handleChange('bdate_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Month</label><select value={formData.bdate_t2 || ''} onChange={(e) => handleChange('bdate_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Month</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Year</label><input type="number" value={formData.bdate_t3 || ''} onChange={(e) => handleChange('bdate_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" /></div>
                <div>
                  <label>Birth Country</label>
                  <select value={formData.bdate_t4 || ''} onChange={(e) => handleChange('bdate_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select Country</option>
                    {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION N1.8 - Witnesses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.8 — Witnesses</h2>
              {[1,2,3].map(w => (
                <div key={w} className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Witness {w}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name & Surname</label>
                      <input type="text" value={formData[`wtn${w}_t1`] || ''} onChange={(e) => handleChange(`wtn${w}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <textarea value={formData[`wtn${w}_t2`] || ''} onChange={(e) => handleChange(`wtn${w}_t2`, e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={formData[`wtn${w}_t3`] || ''} onChange={(e) => handleChange(`wtn${w}_t3`, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={formData[`wtn${w}_t4`]?.replace(/\D/g, '') || ''} onChange={(e) => handleChange(`wtn${w}_t4`, e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="0712345678" />
                      <p className="text-xs text-gray-500 mt-1">Auto-formats to +27XXXXXXXXX</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select value={formData[`wtn${w}_t5`] || ''} onChange={(e) => handleChange(`wtn${w}_t5`, e.target.value)} className="w-full border rounded-lg px-3 py-2">
                        <option value="">Select Country</option>
                        {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Corroboration</label>
                      <textarea value={formData[`wtn${w}_t6`] || ''} onChange={(e) => handleChange(`wtn${w}_t6`, e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="How you know the applicant... (Auto-sentence case)" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION N1.9 - Principal Notice Offices */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.9 — Principal Notice Offices</h2>
              <div className="grid grid-cols-1 gap-4">
                <div><label>Office of the Master</label><textarea value={formData.pno_t1 || ''} onChange={(e) => handleChange('pno_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={4} /></div>
                <div><label>Office of the Minister of Home Affairs</label><textarea value={formData.pno_t2 || ''} onChange={(e) => handleChange('pno_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={4} /></div>
                <div><label>Office of the SARS Commissioner</label><textarea value={formData.pno_t3 || ''} onChange={(e) => handleChange('pno_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={3} /></div>
                <div><label>Office of the Minister of Finance</label><textarea value={formData.pno_t4 || ''} onChange={(e) => handleChange('pno_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={3} /></div>
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
