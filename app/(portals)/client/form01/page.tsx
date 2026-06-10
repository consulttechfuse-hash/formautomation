'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Helper functions for text formatting
const toSentenceCase = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const toCapitalizeEachWord = (str: string) => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const toUppercase = (str: string) => str?.toUpperCase() || '';
const toLowercase = (str: string) => str?.toLowerCase() || '';

const formatPostalCode = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/[\[\]]/g, '');
  return `[${cleaned}]`;
};

interface Form01Data {
  user_id?: string;
  user_email?: string;
  // N1.1 - National Naming
  fn_t1?: string;
  fn_t2?: string;
  fn_t3?: string;
  fni_t1?: string;
  fni_t2?: string;
  mdn_t1?: string;
  mdn_t2?: string;
  mdn_t3?: string;
  mdn_t4?: string;
  mdn_t5?: string;
  mdn2_t1?: string;
  mdn3_t1?: string;
  mdn4_t1?: string;
  mdn5_t1?: string;
  mdni_t1?: string;
  srn_t1?: string;
  srn_t2?: string;
  srn_t3?: string;
  srni_t1?: string;
  srni_t2?: string;
  bsrn_t1?: string;
  bsrn_t2?: string;
  bsrn_t3?: string;
  mr1_t1?: string;
  mr1_t2?: string;
  mr1_t3?: string;
  mr2_t1?: string;
  mr3_t1?: string;
  mr4_t1?: string;
  mr5_t1?: string;
  no_middle_name?: string;
  bsrn_not_applicable?: string;
  mr_not_married?: string;
  no_children?: string;
  // N1.2 - Children
  chld1_t1?: string;
  chld1_id?: string;
  chld2_t1?: string;
  chld2_id?: string;
  chld3_t1?: string;
  chld3_id?: string;
  chld4_t1?: string;
  chld4_id?: string;
  chld5_t1?: string;
  chld5_id?: string;
  chld6_t1?: string;
  chld6_id?: string;
  chld7_t1?: string;
  chld7_id?: string;
  // N1.3 - Contact
  ema_t1?: string;
  ema_t2?: string;
  cnt_1?: string;
  // N1.4.1 - Father
  pffn_t1?: string;
  pffn_t2?: string;
  pffn_t3?: string;
  pfbt_t2?: string;
  pfbt_t3?: string;
  pfbt_t4?: string;
  pfbp_t1?: string;
  pfbp_t2?: string;
  pfbp_t3?: string;
  pfbp_t4?: string;
  // N1.4.2 - Mother
  pmfn_t1?: string;
  pmfn_t2?: string;
  pmfn_t3?: string;
  pmfn_t3_1?: string;
  pmbd_t2?: string;
  pmbd_t3?: string;
  pmbd_t4?: string;
  pmbp_t1?: string;
  pmbp_t2?: string;
  pmbp_t3?: string;
  pmbp_t4?: string;
  pmp_t1?: string;
  pmp_t2?: string;
  pmp_t3?: string;
  pmp_t4?: string;
  pmp_t5?: string;
  pfadr_1?: string;
  // N1.5 - Addresses
  strn_t1?: string;
  strn_t2?: string;
  sbn_t1?: string;
  sbn_t2?: string;
  sbn_t3?: string;
  aptn_t1?: string;
  aptn_t2?: string;
  aptn_t3?: string;
  ctn_t1?: string;
  ctn_t2?: string;
  ctn_t3?: string;
  dstr_t1?: string;
  dstr_t2?: string;
  dstr_t3?: string;
  spn_t1?: string;
  spn_t2?: string;
  spn_t3?: string;
  ctr_t1?: string;
  ctr_t2?: string;
  ctr_t3?: string;
  ptc_t1?: string;
  cadr_t1?: string;
  cadr_t2?: string;
  cadr_t3?: string;
  adr_stack?: string;
  // N1.6 - Genders
  gen_t1?: string;
  gen_t2?: string;
  she_t1?: string;
  she_t2?: string;
  bgr_t1?: string;
  bgr_t2?: string;
  his_t1?: string;
  his_t2?: string;
  // N1.7 - Dates
  bdate_t1?: string;
  bdate_t2?: string;
  bdate_t2_1?: string;
  bdate_t3?: string;
  bdate_t4?: string;
  dis_t1?: string;
  dis_t2?: string;
  dis_t3?: string;
  dtn_t1?: string;
  dtn_t2?: string;
  dtn_t3?: string;
  dil_t1?: string;
  dil_t2?: string;
  dil_t3?: string;
  dal_t1?: string;
  dal_t2?: string;
  // N1.8 - Witnesses
  wtn1_t1?: string;
  wtn1_t2?: string;
  wtn1_t3?: string;
  wtn1_t4?: string;
  wtn1_t5?: string;
  wtn1_t6?: string;
  wtn2_t1?: string;
  wtn2_t2?: string;
  wtn2_t3?: string;
  wtn2_t4?: string;
  wtn2_t5?: string;
  wtn2_t6?: string;
  wtn3_t1?: string;
  wtn3_t2?: string;
  wtn3_t3?: string;
  wtn3_t4?: string;
  wtn3_t5?: string;
  wtn3_t6?: string;
  // N1.9 - Principal Notice Offices
  pno_t1?: string;
  pno_t2?: string;
  pno_t3?: string;
  pno_t4?: string;
  [key: string]: any;
}

export default function Form01Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Form01Data>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [childCount, setChildCount] = useState(1);
  const [marriedSurnameCount, setMarriedSurnameCount] = useState(1);
  const [middleNameCount, setMiddleNameCount] = useState(1);
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
    } else {
      setFormData({ user_email: user.email });
    }

    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    let formattedValue = value;
    
    // Apply formatting rules based on field type
    if (field === 'fn_t1' || field === 'srn_t1' || field === 'bsrn_t1') {
      // Single word names - sentence case, no spaces allowed
      formattedValue = toSentenceCase(value).replace(/\s/g, '');
    } else if (field === 'mdn_t1' || field === 'mdn2_t1' || field === 'mdn3_t1' || field === 'mdn4_t1' || field === 'mdn5_t1') {
      // Middle names - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'strn_t1' || field === 'sbn_t1' || field === 'aptn_t1' || field === 'ctn_t1' || field === 'dstr_t1' || field === 'spn_t1') {
      // Address fields - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'ptc_t1') {
      // Postal code - wrap in brackets
      formattedValue = formatPostalCode(value);
    } else if (field === 'pffn_t1' || field === 'pmfn_t1' || field === 'pmfn_t3_1') {
      // Parent names - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'wtn1_t1' || field === 'wtn2_t1' || field === 'wtn3_t1') {
      // Witness names - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    } else if (field === 'pfbp_t1' || field === 'pfbp_t2' || field === 'pfbp_t3' || field === 'pmbp_t1' || field === 'pmbp_t2' || field === 'pmbp_t3') {
      // Place names - capitalize each word
      formattedValue = toCapitalizeEachWord(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Auto-calculate derived fields
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
    
    // Update full name concatenations
    if (field === 'fn_t1' || field === 'mdn_t1' || field === 'srn_t1') {
      const fn = field === 'fn_t1' ? formattedValue : formData.fn_t1;
      const mn = field === 'mdn_t1' ? formattedValue : formData.mdn_t1;
      const sn = field === 'srn_t1' ? formattedValue : formData.srn_t1;
      const fullName = `${fn || ''} ${mn || ''} ${sn || ''}`.trim().replace(/\s+/g, ' ');
      setFormData(prev => ({
        ...prev,
        fln_t1: toCapitalizeEachWord(fullName),
        fln_t2: toUppercase(fullName),
        fln_t3: toLowercase(fullName),
        fln_t4: `${fn || ''} ${sn || ''}`.trim(),
        fln_t5: `${fn || ''} ${prev.mdni_t1 || ''} ${sn || ''}`.trim(),
        fln_t6: `${prev.fni_t1 || ''} ${prev.mdni_t1 || ''} ${sn || ''}`.trim(),
      }));
    }
    
    // Update address concatenation
    if (['strn_t1', 'sbn_t1', 'aptn_t1', 'ctn_t1', 'dstr_t1', 'spn_t1', 'ctr_t1', 'ptc_t1'].includes(field)) {
      const strn = formData.strn_t1 || '';
      const sbn = formData.sbn_t1 || '';
      const aptn = formData.aptn_t1 || '';
      const ctn = formData.ctn_t1 || '';
      const dstr = formData.dstr_t1 || '';
      const spn = formData.spn_t1 || '';
      const ctr = formData.ctr_t1 || '';
      const ptc = formData.ptc_t1 || '';
      const addressParts = [strn, sbn, aptn, ctn, dstr, spn, ctr, ptc].filter(p => p);
      const fullAddress = addressParts.join(', ');
      setFormData(prev => ({
        ...prev,
        cadr_t1: fullAddress,
        cadr_t2: toUppercase(fullAddress),
        cadr_t3: toLowercase(fullAddress),
        adr_stack: addressParts.join('\n'),
      }));
    }
    
    // Update date formats
    if (['bdate_t1', 'bdate_t2', 'bdate_t3'].includes(field)) {
      const day = formData.bdate_t1 || '';
      const month = formData.bdate_t2 || '';
      const year = formData.bdate_t3 || '';
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[parseInt(month) - 1] || '';
      
      setFormData(prev => ({
        ...prev,
        bdate_t2_1: monthName,
        dis_t1: year && month && day ? `${year}/${month}/${day}` : '',
        dis_t2: year && month && day ? `${year}-${month}-${day}` : '',
        dis_t3: day && month && year ? `${day} ${month}, ${year}` : '',
        dtn_t1: month && day && year ? `${month}/${day}/${year}` : '',
        dtn_t2: month && day && year ? `${month}-${day}/${year}` : '',
        dtn_t3: month && day && year ? `${month} ${day}, ${year}` : '',
        dil_t1: year && monthName && day ? `${year} ${monthName} ${day}` : '',
        dil_t2: year && monthName && day ? `${year} ${toUppercase(monthName)} ${day}` : '',
        dal_t1: monthName && day && year ? `${monthName} ${day}, ${year}` : '',
        dal_t2: monthName && day && year ? `${toUppercase(monthName)} ${day}, ${year}` : '',
      }));
    }
  };

  const addChild = () => {
    if (childCount < 7) {
      setChildCount(childCount + 1);
    }
  };

  const addMarriedSurname = () => {
    if (marriedSurnameCount < 5) {
      setMarriedSurnameCount(marriedSurnameCount + 1);
    }
  };

  const addMiddleName = () => {
    if (middleNameCount < 5) {
      setMiddleNameCount(middleNameCount + 1);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fn_t1?.trim()) newErrors.fn_t1 = 'First Name is required';
    if (!formData.srn_t1?.trim()) newErrors.srn_t1 = 'Surname is required';
    if (!formData.ema_t1?.trim()) newErrors.ema_t1 = 'Email is required';
    if (!formData.cnt_1?.trim()) newErrors.cnt_1 = 'Phone number is required';
    if (formData.ema_t1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ema_t1)) {
      newErrors.ema_t1 = 'Valid email address required';
    }
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

  const renderChildFields = () => {
    const children = [];
    for (let i = 1; i <= childCount; i++) {
      children.push(
        <div key={`child-${i}`} className="border-l-4 border-blue-200 pl-4 mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Child {i}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={formData[`chld${i}_t1`] || ''} onChange={(e) => handleChange(`chld${i}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isChildrenDisabled} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID/Passport Number</label>
              <input type="text" value={formData[`chld${i}_id`] || ''} onChange={(e) => handleChange(`chld${i}_id`, e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isChildrenDisabled} />
            </div>
          </div>
        </div>
      );
    }
    return children;
  };

  const renderMarriedSurnameFields = () => {
    const fields = [];
    for (let i = 2; i <= marriedSurnameCount; i++) {
      fields.push(
        <div key={`mr-${i}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Previous Married Surname {i-1}</label>
          <input type="text" value={formData[`mr${i}_t1`] || ''} onChange={(e) => handleChange(`mr${i}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isMarriedDisabled} />
        </div>
      );
    }
    return fields;
  };

  const renderMiddleNameFields = () => {
    const fields = [];
    for (let i = 2; i <= middleNameCount; i++) {
      fields.push(
        <div key={`mdn-${i}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name {i-1}</label>
          <input type="text" value={formData[`mdn${i}_t1`] || ''} onChange={(e) => handleChange(`mdn${i}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isMiddleNameDisabled} />
        </div>
      );
    }
    return fields;
  };

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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">No Middle Name/s</label>
                <select value={formData.no_middle_name || ''} onChange={(e) => handleChange('no_middle_name', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">No</option>
                  <option value="Yes">Yes - I have no middle name</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.fn_t1 || ''} onChange={(e) => handleChange('fn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.fn_t1 && <p className="text-red-500 text-xs mt-1">{errors.fn_t1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input type="text" value={formData.mdn_t1 || ''} onChange={(e) => handleChange('mdn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isMiddleNameDisabled} />
                </div>
                {renderMiddleNameFields()}
                {!isMiddleNameDisabled && middleNameCount < 5 && (
                  <button type="button" onClick={addMiddleName} className="text-blue-600 text-sm hover:underline mt-2">+ Add another middle name</button>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.srn_t1 || ''} onChange={(e) => handleChange('srn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.srn_t1 && <p className="text-red-500 text-xs mt-1">{errors.srn_t1}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Not Applicable (Surname at Birth)</label>
                <select value={formData.bsrn_not_applicable || ''} onChange={(e) => handleChange('bsrn_not_applicable', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">No</option>
                  <option value="Yes">Yes - Not applicable</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname at Birth</label>
                  <input type="text" value={formData.bsrn_t1 || ''} onChange={(e) => handleChange('bsrn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isBsrnDisabled} />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Never Married</label>
                <select value={formData.mr_not_married || ''} onChange={(e) => handleChange('mr_not_married', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">No</option>
                  <option value="Yes">Yes - Never married</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Married Surname</label>
                  <input type="text" value={formData.mr1_t1 || ''} onChange={(e) => handleChange('mr1_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isMarriedDisabled} />
                </div>
                {renderMarriedSurnameFields()}
                {!isMarriedDisabled && marriedSurnameCount < 5 && (
                  <button type="button" onClick={addMarriedSurname} className="text-blue-600 text-sm hover:underline mt-2">+ Add previous married surname</button>
                )}
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
              {!isChildrenDisabled && renderChildFields()}
              {!isChildrenDisabled && childCount < 7 && (
                <button type="button" onClick={addChild} className="text-blue-600 text-sm hover:underline mt-2">+ Add another child</button>
              )}
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
                  <input type="tel" value={formData.cnt_1 || ''} onChange={(e) => handleChange('cnt_1', e.target.value)} placeholder="+27 XX XXX XXXX" className="w-full border rounded-lg px-3 py-2" required />
                  {errors.cnt_1 && <p className="text-red-500 text-xs mt-1">{errors.cnt_1}</p>}
                </div>
              </div>
            </div>

            {/* N1.4 — Father's Details */}
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
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Birth Place - Town/City</label><input type="text" value={formData.pfbp_t1 || ''} onChange={(e) => handleChange('pfbp_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Birth Place - District</label><input type="text" value={formData.pfbp_t2 || ''} onChange={(e) => handleChange('pfbp_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Birth Place - Province</label><input type="text" value={formData.pfbp_t3 || ''} onChange={(e) => handleChange('pfbp_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Birth Place - Country</label><select value={formData.pfbp_t4 || ''} onChange={(e) => handleChange('pfbp_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option><option value="South Africa">South Africa</option><option value="Other">Other</option></select></div>
              </div>
            </div>

            {/* N1.4.2 — Mother's Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.4.2 — Mother's Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Mother's Full Name</label><input type="text" value={formData.pmfn_t1 || ''} onChange={(e) => handleChange('pmfn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother's Maiden Surname</label><input type="text" value={formData.pmfn_t3_1 || ''} onChange={(e) => handleChange('pmfn_t3_1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div><label>Birth Day</label><select value={formData.pmbd_t2 || ''} onChange={(e) => handleChange('pmbd_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Month</label><select value={formData.pmbd_t3 || ''} onChange={(e) => handleChange('pmbd_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Month</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Year</label><input type="number" value={formData.pmbd_t4 || ''} onChange={(e) => handleChange('pmbd_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><label>Birth Place - Town/City</label><input type="text" value={formData.pmbp_t1 || ''} onChange={(e) => handleChange('pmbp_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Birth Place - District</label><input type="text" value={formData.pmbp_t2 || ''} onChange={(e) => handleChange('pmbp_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Birth Place - Province</label><input type="text" value={formData.pmbp_t3 || ''} onChange={(e) => handleChange('pmbp_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Birth Place - Country</label><select value={formData.pmbp_t4 || ''} onChange={(e) => handleChange('pmbp_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option><option value="South Africa">South Africa</option><option value="Other">Other</option></select></div>
              </div>
            </div>

            {/* N1.5 — Addresses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.5 — Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Street Name</label><input type="text" value={formData.strn_t1 || ''} onChange={(e) => handleChange('strn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 210 Jackson Street" /></div>
                <div><label>Suburb</label><input type="text" value={formData.sbn_t1 || ''} onChange={(e) => handleChange('sbn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Apartment/Unit</label><input type="text" value={formData.aptn_t1 || ''} onChange={(e) => handleChange('aptn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>City/Town</label><input type="text" value={formData.ctn_t1 || ''} onChange={(e) => handleChange('ctn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>District</label><input type="text" value={formData.dstr_t1 || ''} onChange={(e) => handleChange('dstr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Province</label><input type="text" value={formData.spn_t1 || ''} onChange={(e) => handleChange('spn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label>Postal Code</label><input type="text" value={formData.ptc_t1?.replace(/[\[\]]/g, '') || ''} onChange={(e) => handleChange('ptc_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="1234" /></div>
                <div><label>Country</label><select value={formData.ctr_t1 || ''} onChange={(e) => handleChange('ctr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option><option value="South Africa">South Africa</option><option value="Other">Other</option></select></div>
              </div>
            </div>

            {/* N1.6 — Genders */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.6 — Genders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Gender</label><select value={formData.gen_t1 || ''} onChange={(e) => handleChange('gen_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="woman">Woman</option><option value="man">Man</option></select></div>
                <div><label>Pronoun</label><select value={formData.she_t1 || ''} onChange={(e) => handleChange('she_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="she">She</option><option value="he">He</option></select></div>
                <div><label>Reference</label><select value={formData.bgr_t1 || ''} onChange={(e) => handleChange('bgr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="girl">Girl</option><option value="boy">Boy</option></select></div>
                <div><label>Possessive</label><select value={formData.his_t1 || ''} onChange={(e) => handleChange('his_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="hers">Hers</option><option value="his">His</option></select></div>
              </div>
            </div>

            {/* N1.7 — Birth Date */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.7 — Birth Date</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label>Birth Day</label><select value={formData.bdate_t1 || ''} onChange={(e) => handleChange('bdate_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Month</label><select value={formData.bdate_t2 || ''} onChange={(e) => handleChange('bdate_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Month</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}</select></div>
                <div><label>Birth Year</label><input type="number" value={formData.bdate_t3 || ''} onChange={(e) => handleChange('bdate_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" /></div>
                <div><label>Birth Country</label><select value={formData.bdate_t4 || ''} onChange={(e) => handleChange('bdate_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option><option value="South Africa">South Africa</option><option value="Other">Other</option></select></div>
              </div>
            </div>

            {/* Witnesses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.8 — Witnesses</h2>
              {[1,2,3].map(w => (
                <div key={w} className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Witness {w}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label>Full Name & Surname</label><input type="text" value={formData[`wtn${w}_t1`] || ''} onChange={(e) => handleChange(`wtn${w}_t1`, e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                    <div className="md:col-span-2"><label>Full Address</label><textarea value={formData[`wtn${w}_t2`] || ''} onChange={(e) => handleChange(`wtn${w}_t2`, e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
                    <div><label>Email</label><input type="email" value={formData[`wtn${w}_t3`] || ''} onChange={(e) => handleChange(`wtn${w}_t3`, e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                    <div><label>Phone Number</label><input type="tel" value={formData[`wtn${w}_t4`] || ''} onChange={(e) => handleChange(`wtn${w}_t4`, e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                    <div><label>Country</label><select value={formData[`wtn${w}_t5`] || ''} onChange={(e) => handleChange(`wtn${w}_t5`, e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select Country</option><option value="South Africa">South Africa</option><option value="Other">Other</option></select></div>
                    <div className="md:col-span-2"><label>Corroboration</label><textarea value={formData[`wtn${w}_t6`] || ''} onChange={(e) => handleChange(`wtn${w}_t6`, e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Please explain how you know the applicant..." /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Principal Notice Offices */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.9 — Principal Notice Offices</h2>
              <div className="grid grid-cols-1 gap-4">
                <div><label>Office of the Master</label><textarea value={formData.pno_t1 || ''} onChange={(e) => handleChange('pno_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
                <div><label>Office of the Minister of Home Affairs</label><textarea value={formData.pno_t2 || ''} onChange={(e) => handleChange('pno_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
                <div><label>Office of the SARS Commissioner</label><textarea value={formData.pno_t3 || ''} onChange={(e) => handleChange('pno_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
                <div><label>Office of the Minister of Finance</label><textarea value={formData.pno_t4 || ''} onChange={(e) => handleChange('pno_t4', e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} /></div>
              </div>
            </div>

            {/* Hidden Auto-Calculation Fields (Visible for testing) */}
            <div className="border-b pb-6 bg-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Auto-Calculation Fields (Testing - Will be hidden)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div><strong>fln_t1:</strong> {formData.fln_t1 || '-'}</div>
                <div><strong>fln_t2:</strong> {formData.fln_t2 || '-'}</div>
                <div><strong>fln_t3:</strong> {formData.fln_t3 || '-'}</div>
                <div><strong>fn_t2:</strong> {formData.fn_t2 || '-'}</div>
                <div><strong>fn_t3:</strong> {formData.fn_t3 || '-'}</div>
                <div><strong>srn_t2:</strong> {formData.srn_t2 || '-'}</div>
                <div><strong>cadr_t1:</strong> {formData.cadr_t1 || '-'}</div>
                <div><strong>dis_t1 (YYYY/MM/DD):</strong> {formData.dis_t1 || '-'}</div>
                <div><strong>dtn_t1 (MM/DD/YYYY):</strong> {formData.dtn_t1 || '-'}</div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
              <button type="button" onClick={() => router.push('/client/dashboard')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Back</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save & Continue →'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
