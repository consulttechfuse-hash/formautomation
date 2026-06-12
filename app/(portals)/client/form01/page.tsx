'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Helper functions (same as before)
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
  let cleaned = str.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    cleaned = '+27' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

const toSentenceCaseWitness = (str: string) => {
  if (!str) return '';
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
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [childCount, setChildCount] = useState(1);
  const [middleNameCount, setMiddleNameCount] = useState(1);
  const [prevMarriedSurnameCount, setPrevMarriedSurnameCount] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();

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
      
      let childIdx = 1;
      while (data[`chld${childIdx}_t1`]) {
        childIdx++;
      }
      setChildCount(Math.max(1, childIdx - 1));
      
      let midIdx = 2;
      while (data[`mdn${midIdx}_t1`]) {
        midIdx++;
      }
      setMiddleNameCount(Math.max(1, midIdx - 1));
      
      // FIX: Start from 1, not 2
      let prevIdx = 1;
      while (data[`pmr${prevIdx}_t1`]) {
        prevIdx++;
      }
      setPrevMarriedSurnameCount(Math.max(0, prevIdx - 1));
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

  const saveData = async (dataToSave: any) => {
    const { data: existing } = await supabase
      .from('form01_data')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('form01_data')
        .update({
          user_email: formData.user_email,
          updated_at: new Date().toISOString(),
          ...dataToSave
        })
        .eq('user_id', userId);
      return error;
    } else {
      const { error } = await supabase
        .from('form01_data')
        .insert({
          user_id: userId,
          user_email: formData.user_email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...dataToSave
        });
      return error;
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const error = await saveData(formData);
    
    if (error) {
      alert('Error saving draft: ' + error.message);
    } else {
      setLastSaved(new Date());
      alert('Draft saved successfully!');
    }
    setSaving(false);
  };

  const handleSubmitLock = async () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    
    const error = await saveData(formData);
    
    if (error) {
      alert('Error saving form: ' + error.message);
      setSubmitting(false);
      return;
    }

    await supabase
      .from('client_flow_state')
      .update({
        step_4_form01_completed: true,
        current_step: 5,
        lock_type: 'locked_step',
        locked_step: 4,
        locked_reason: 'Form-01 completed. To edit, request unlock from agent.',
        updated_at: new Date().toISOString()
      })
      .eq('client_id', userId);

    router.push('/client/forms-02-17');
  };

  const handleChange = (field: string, value: any) => {
    let formattedValue = value;
    
    if (field === 'fn_t1' || field === 'srn_t1') {
      formattedValue = toSentenceCase(value).replace(/\s/g, '');
    } else if (field === 'bsrn_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'pmfn_t3_1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'mr1_t1' || field === 'mdn_t1' || field === 'pffn_t1' || field === 'pmfn_t1') {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('mdn') && field.endsWith('_t1')) {
      formattedValue = toCapitalizeEachWord(value);
    } else if (field.startsWith('pmr') && field.endsWith('_t1')) {
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
      formattedValue = toSentenceCaseWitness(value);
    } else if (field === 'gen_t1') {
      formattedValue = value;
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
  };

  const addChild = () => {
    setChildCount(childCount + 1);
  };

  const addMiddleName = () => {
    setMiddleNameCount(middleNameCount + 1);
  };

  const addPrevMarriedSurname = () => {
    setPrevMarriedSurnameCount(prevMarriedSurnameCount + 1);
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

  const renderChildFields = () => {
    const children = [];
    for (let i = 1; i <= childCount; i++) {
      children.push(
        <div key={`child-${i}`} className="border-l-4 border-blue-200 pl-4 mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Child {i}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={formData[`chld${i}_t1`] || ''} onChange={(e) => handleChange(`chld${i}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID/Passport Number</label>
              <input type="text" value={formData[`chld${i}_id`] || ''} onChange={(e) => handleChange(`chld${i}_id`, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>
      );
    }
    return children;
  };

  const renderMiddleNameFields = () => {
    const fields = [];
    for (let i = 2; i <= middleNameCount; i++) {
      fields.push(
        <div key={`mdn-${i}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name {i-1}</label>
          <input type="text" value={formData[`mdn${i}_t1`] || ''} onChange={(e) => handleChange(`mdn${i}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
      );
    }
    return fields;
  };

  // FIX: Start from i = 1
  const renderPrevMarriedSurnameFields = () => {
    const fields = [];
    for (let i = 1; i <= prevMarriedSurnameCount; i++) {
      const fieldName = `pmr${i}_t1`;
      fields.push(
        <div key={`pmr-${i}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Previous Married Surname {i}</label>
          <input type="text" value={formData[fieldName] || ''} onChange={(e) => handleChange(fieldName, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
      );
    }
    return fields;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-white">Form-01: Application Form</h1>
            <p className="text-blue-100 mt-1">Complete all required fields (*)</p>
            {lastSaved && (
              <p className="text-blue-100 text-xs mt-1">Last saved: {lastSaved.toLocaleTimeString()}</p>
            )}
          </div>

          <div className="p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto">
            
            {/* N1.1 — National Naming Information */}
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
                {renderMiddleNameFields()}
                <div>
                  <button type="button" onClick={addMiddleName} className="text-blue-600 text-sm hover:underline">
                    + Add another middle name
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.srn_t1 || ''} onChange={(e) => handleChange('srn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.srn_t1 && <p className="text-red-500 text-xs mt-1">{errors.srn_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname at Birth</label>
                  <input type="text" value={formData.bsrn_t1 || ''} onChange={(e) => handleChange('bsrn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Married Surname</label>
                  <input type="text" value={formData.mr1_t1 || ''} onChange={(e) => handleChange('mr1_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                {renderPrevMarriedSurnameFields()}
                <div>
                  <button type="button" onClick={addPrevMarriedSurname} className="text-blue-600 text-sm hover:underline">
                    + Add previous married surname
                  </button>
                </div>
              </div>
            </div>

            {/* N1.2 — Children */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.2 — Children</h2>
              {renderChildFields()}
              <button type="button" onClick={addChild} className="text-blue-600 text-sm hover:underline">
                + Add another child
              </button>
            </div>

            {/* N1.3 — Contact Information */}
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
                  <input type="tel" value={formData.cnt_1?.replace(/\D/g, '') || ''} onChange={(e) => handleChange('cnt_1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.cnt_1 && <p className="text-red-500 text-xs mt-1">{errors.cnt_1}</p>}
                </div>
              </div>
            </div>

            {/* N1.4.1 — Father's Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.4.1 — Father's Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Father's Full Name</label><input type="text" value={formData.pffn_t1 || ''} onChange={(e) => handleChange('pffn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Birth Day</label><select value={formData.pfbt_t2 || ''} onChange={(e) => handleChange('pfbt_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Month</label><select value={formData.pfbt_t3 || ''} onChange={(e) => handleChange('pfbt_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Month</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Year</label><input type="number" value={formData.pfbt_t4 || ''} onChange={(e) => handleChange('pfbt_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><label>Town/City</label><input type="text" value={formData.pfbp_t1 || ''} onChange={(e) => handleChange('pfbp_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>District</label><input type="text" value={formData.pfbp_t2 || ''} onChange={(e) => handleChange('pfbp_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Province</label><input type="text" value={formData.pfbp_t3 || ''} onChange={(e) => handleChange('pfbp_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Country</label><select value={formData.pfbp_t4 || ''} onChange={(e) => handleChange('pfbp_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option>{countryList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
            </div>

            {/* N1.4.2 — Mother's Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.4.2 — Mother's Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Mother's Full Name</label><input type="text" value={formData.pmfn_t1 || ''} onChange={(e) => handleChange('pmfn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Maiden Surname</label><input type="text" value={formData.pmfn_t3_1 || ''} onChange={(e) => handleChange('pmfn_t3_1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
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
                <div><label>Country</label><select value={formData.pmbp_t4 || ''} onChange={(e) => handleChange('pmbp_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option>{countryList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
            </div>

            {/* N1.5 — Addresses */}
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
                <div><label>Country</label><select value={formData.ctr_t1 || ''} onChange={(e) => handleChange('ctr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option>{countryList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
            </div>

            {/* N1.6 — Genders */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.6 — Genders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Gender Type</label><select value={formData.gen_t1 || ''} onChange={(e) => handleChange('gen_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="man">Man</option><option value="woman">Woman</option></select></div>
                <div><label>Pronoun (Auto-filled)</label><input type="text" value={formData.she_t1 || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" /></div>
                <div><label>Reference (Auto-filled)</label><input type="text" value={formData.bgr_t1 || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" /></div>
                <div><label>Possessive (Auto-filled)</label><input type="text" value={formData.his_t1 || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" /></div>
              </div>
            </div>

            {/* N1.7 — Birth Date */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.7 — Birth Date</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label>Birth Day</label><select value={formData.bdate_t1 || ''} onChange={(e) => handleChange('bdate_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Month</label><select value={formData.bdate_t2 || ''} onChange={(e) => handleChange('bdate_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Month</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Year</label><input type="number" value={formData.bdate_t3 || ''} onChange={(e) => handleChange('bdate_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" /></div>
                <div><label>Birth Country</label><select value={formData.bdate_t4 || ''} onChange={(e) => handleChange('bdate_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option>{countryList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
            </div>

            {/* N1.8 — Witnesses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.8 — Witnesses</h2>
              {[1,2,3].map(w => (
                <div key={w} className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Witness {w}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label>Full Name & Surname</label><input type="text" value={formData[`wtn${w}_t1`] || ''} onChange={(e) => handleChange(`wtn${w}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                    <div className="md:col-span-2"><label>Full Address</label><textarea value={formData[`wtn${w}_t2`] || ''} onChange={(e) => handleChange(`wtn${w}_t2`, e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
                    <div><label>Email</label><input type="email" value={formData[`wtn${w}_t3`] || ''} onChange={(e) => handleChange(`wtn${w}_t3`, e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                    <div><label>Phone Number</label><input type="tel" value={formData[`wtn${w}_t4`]?.replace(/\D/g, '') || ''} onChange={(e) => handleChange(`wtn${w}_t4`, e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                    <div><label>Country</label><select value={formData[`wtn${w}_t5`] || ''} onChange={(e) => handleChange(`wtn${w}_t5`, e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option>{countryList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="md:col-span-2"><label>Corroboration</label><textarea value={formData[`wtn${w}_t6`] || ''} onChange={(e) => handleChange(`wtn${w}_t6`, e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* N1.9 — Principal Notice Offices */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.9 — Principal Notice Offices</h2>
              <div className="grid grid-cols-1 gap-4">
                <div><label>Office of the Master</label><textarea value={formData.pno_t1 || ''} onChange={(e) => handleChange('pno_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={4} /></div>
                <div><label>Office of the Minister of Home Affairs</label><textarea value={formData.pno_t2 || ''} onChange={(e) => handleChange('pno_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={4} /></div>
                <div><label>Office of the SARS Commissioner</label><textarea value={formData.pno_t3 || ''} onChange={(e) => handleChange('pno_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={3} /></div>
                <div><label>Office of the Minister of Finance</label><textarea value={formData.pno_t4 || ''} onChange={(e) => handleChange('pno_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={3} /></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
              <button type="button" onClick={() => router.push('/client/dashboard')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Back
              </button>
              <button 
                type="button" 
                onClick={handleSaveDraft} 
                disabled={saving}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                type="button" 
                onClick={handleSubmitLock} 
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Submit & Lock →'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="text-yellow-600 text-5xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Submission</h2>
              <p className="text-gray-600">Are you sure all your information is correct and complete?</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Once you submit, Form-01 will be locked and you cannot make changes unless you request an unlock from your agent.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Yes, Submit & Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
