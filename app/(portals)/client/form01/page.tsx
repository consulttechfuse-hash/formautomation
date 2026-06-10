'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Match your actual database columns
interface Form01Data {
  fn_t1: string;
  srn_t1: string;
  mdn_t1: string;
  bsrn_t1: string;
  mr1_t1: string;
  ema_t1: string;
  cnt_1: string;
  pffn_t1: string;
  pfbt_t2: string;
  pfbt_t3: string;
  pfbt_t4: string;
  pfbp_t1: string;
  pfbp_t2: string;
  pfbp_t3: string;
  pfbp_t4: string;
  pmfn_t1: string;
  pmfn_t3_1: string;
  pmbd_t2: string;
  pmbd_t3: string;
  pmbd_t4: string;
  pmbp_t1: string;
  pmbp_t2: string;
  pmbp_t3: string;
  pmbp_t4: string;
  strn_t1: string;
  sbn_t1: string;
  aptn_t1: string;
  ctn_t1: string;
  dstr_t1: string;
  spn_t1: string;
  ctr_t1: string;
  ptc_t1: string;
  gen_t1: string;
  she_t1: string;
  bgr_t1: string;
  his_t1: string;
  bdate_t1: string;
  bdate_t2: string;
  bdate_t3: string;
  bdate_t4: string;
  wtn1_t1: string;
  wtn1_t2: string;
  wtn1_t3: string;
  wtn1_t4: string;
  wtn1_t5: string;
  wtn1_t6: string;
  wtn2_t1: string;
  wtn2_t2: string;
  wtn2_t3: string;
  wtn2_t4: string;
  wtn2_t5: string;
  wtn2_t6: string;
  wtn3_t1: string;
  wtn3_t2: string;
  wtn3_t3: string;
  wtn3_t4: string;
  wtn3_t5: string;
  wtn3_t6: string;
  [key: string]: any;
}

export default function Form01Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Form01Data>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
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

    // Load existing form data
    const { data, error } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setFormData(data);
    } else {
      // Initialize empty form with user email
      setFormData({ user_email: user.email });
    }

    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate derived fields
    if (field === 'fn_t1') {
      setFormData(prev => ({
        ...prev,
        fn_t2: value?.toUpperCase() || '',
        fn_t3: value?.toLowerCase() || '',
        fni_t1: value?.charAt(0)?.toLowerCase() || '',
        fni_t2: value?.charAt(0)?.toUpperCase() || '',
      }));
    }
    
    if (field === 'srn_t1') {
      setFormData(prev => ({
        ...prev,
        srn_t2: value?.toUpperCase() || '',
        srn_t3: value?.toLowerCase() || '',
      }));
    }
    
    if (field === 'mdn_t1') {
      setFormData(prev => ({
        ...prev,
        mdn_t2: value?.toUpperCase() || '',
        mdn_t3: value?.toLowerCase() || '',
      }));
    }
    
    // Full name concatenation
    if (field === 'fn_t1' || field === 'mdn_t1' || field === 'srn_t1') {
      const fn = formData.fn_t1 || '';
      const mn = formData.mdn_t1 || '';
      const sn = formData.srn_t1 || '';
      setFormData(prev => ({
        ...prev,
        fln_t1: `${fn} ${mn} ${sn}`.trim().replace(/\s+/g, ' '),
        fln_t2: `${fn} ${sn}`.trim(),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fn_t1?.trim()) newErrors.fn_t1 = 'First Name is required';
    if (!formData.srn_t1?.trim()) newErrors.srn_t1 = 'Surname is required';
    if (!formData.ema_t1?.trim()) newErrors.ema_t1 = 'Email is required';
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
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      alert('Error saving form: ' + error.message);
      setSaving(false);
      return;
    }

    // Update client_flow_state
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Form-01: Application Form</h1>
            <p className="text-blue-100 mt-1">Please complete all required fields</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.srn_t1 || ''} onChange={(e) => handleChange('srn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.srn_t1 && <p className="text-red-500 text-xs mt-1">{errors.srn_t1}</p>}
                </div>
              </div>
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
                  <input type="tel" value={formData.cnt_1 || ''} onChange={(e) => handleChange('cnt_1', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {errors.cnt_1 && <p className="text-red-500 text-xs mt-1">{errors.cnt_1}</p>}
                </div>
              </div>
            </div>

            {/* N1.5 — Addresses */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.5 — Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
                  <input type="text" value={formData.strn_t1 || ''} onChange={(e) => handleChange('strn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                  <input type="text" value={formData.sbn_t1 || ''} onChange={(e) => handleChange('sbn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
                  <input type="text" value={formData.ctn_t1 || ''} onChange={(e) => handleChange('ctn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input type="text" value={formData.spn_t1 || ''} onChange={(e) => handleChange('spn_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" value={formData.ptc_t1 || ''} onChange={(e) => handleChange('ptc_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={formData.ctr_t1 || ''} onChange={(e) => handleChange('ctr_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select Country</option>
                    <option value="South Africa">South Africa</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* N1.6 — Genders */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.6 — Genders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender Type</label>
                  <select value={formData.gen_t1 || ''} onChange={(e) => handleChange('gen_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select</option>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pronoun</label>
                  <select value={formData.she_t1 || ''} onChange={(e) => handleChange('she_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select</option>
                    <option value="she">She</option>
                    <option value="he">He</option>
                  </select>
                </div>
              </div>
            </div>

            {/* N1.7 — Birth Date */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">N1.7 — Birth Date</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Day</label>
                  <select value={formData.bdate_t1 || ''} onChange={(e) => handleChange('bdate_t1', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Day</option>
                    {[...Array(31)].map((_, i) => (
                      <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Month</label>
                  <select value={formData.bdate_t2 || ''} onChange={(e) => handleChange('bdate_t2', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Month</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={String(i+1).padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Year</label>
                  <input type="number" value={formData.bdate_t3 || ''} onChange={(e) => handleChange('bdate_t3', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => router.push('/client/dashboard')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Back
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save & Continue →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
