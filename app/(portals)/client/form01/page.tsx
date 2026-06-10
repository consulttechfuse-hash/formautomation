'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface FieldConfig {
  id: string;
  dev_name: string;
  label: string;
  field_type: string;
  section: string;
  is_visible: boolean;
  is_required: boolean;
  validation_rules: any;
  dropdown_options: string[];
  depends_on: string;
  auto_complete_source: string;
  display_order: number;
  parent_section: string;
}

interface FormData {
  [key: string]: any;
}

export default function Form01Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<string[]>([]);
  const [childCount, setChildCount] = useState(1);
  const [marriedSurnameCount, setMarriedSurnameCount] = useState(1);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadFieldsAndData();
  }, []);

  const loadFieldsAndData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Load field configuration
    const { data: fieldConfigs } = await supabase
      .from('form01_fields_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (fieldConfigs) {
      setFields(fieldConfigs);
      // Extract unique sections
      const uniqueSections = [...new Set(fieldConfigs.map(f => f.section).filter(Boolean))];
      setSections(uniqueSections);
    }

    // Load existing form data if any
    const { data: existingData } = await supabase
      .from('form01_data')
      .select('form_data')
      .eq('client_id', user.id)
      .single();

    if (existingData?.form_data) {
      setFormData(existingData.form_data);
    }

    setLoading(false);
  };

  const handleInputChange = (devName: string, value: any) => {
    const newFormData = { ...formData, [devName]: value };
    setFormData(newFormData);
    
    // Trigger auto-complete calculations
    calculateAutoCompleteFields(newFormData, devName);
    
    // Clear error for this field
    if (errors[devName]) {
      const newErrors = { ...errors };
      delete newErrors[devName];
      setErrors(newErrors);
    }
  };

  const calculateAutoCompleteFields = (data: FormData, changedField: string) => {
    const newData = { ...data };
    
    // Auto-complete calculations based on Excel schema
    // fn_t1 -> fn_t2 (uppercase), fn_t3 (lowercase), fni_t1 (initial lowercase), fni_t2 (initial uppercase)
    
    if (changedField === 'fn_t1') {
      newData['fn_t2'] = data['fn_t1']?.toUpperCase() || '';
      newData['fn_t3'] = data['fn_t1']?.toLowerCase() || '';
      newData['fni_t1'] = data['fn_t1']?.charAt(0)?.toLowerCase() || '';
      newData['fni_t2'] = data['fn_t1']?.charAt(0)?.toUpperCase() || '';
    }
    
    // srn_t1 -> srn_t2 (uppercase), srn_t3 (lowercase), srni_t1 (initial lowercase), srni_t2 (initial uppercase)
    if (changedField === 'srn_t1') {
      newData['srn_t2'] = data['srn_t1']?.toUpperCase() || '';
      newData['srn_t3'] = data['srn_t1']?.toLowerCase() || '';
      newData['srni_t1'] = data['srn_t1']?.charAt(0)?.toLowerCase() || '';
      newData['srni_t2'] = data['srn_t1']?.charAt(0)?.toUpperCase() || '';
    }
    
    // Full name concatenations
    if (changedField === 'fn_t1' || changedField === 'srn_t1') {
      newData['fln_t1'] = `${data['fn_t1'] || ''} ${data['srn_t1'] || ''}`.trim();
      newData['fln_t2'] = newData['fln_t1']?.toUpperCase() || '';
      newData['fln_t3'] = newData['fln_t1']?.toLowerCase() || '';
    }
    
    setFormData(newData);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    for (const field of fields) {
      if (field.is_required && !formData[field.dev_name]) {
        newErrors[field.dev_name] = `${field.label} is required`;
      }
      
      // Email validation
      if (field.field_type === 'email' && formData[field.dev_name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.dev_name])) {
          newErrors[field.dev_name] = 'Valid email address required';
        }
      }
      
      // Phone validation
      if (field.dev_name === 'cnt_1' && formData[field.dev_name]) {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(formData[field.dev_name])) {
          newErrors[field.dev_name] = 'Valid phone number required (10-15 digits)';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Save to form01_data
    const { error: saveError } = await supabase
      .from('form01_data')
      .upsert({
        client_id: user.id,
        form_data: formData,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id'
      });

    if (saveError) {
      alert('Error saving form: ' + saveError.message);
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
      .eq('client_id', user.id);

    router.push('/client/forms-02-17');
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.dev_name] || '';
    const error = errors[field.dev_name];
    
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.dev_name, e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            required={field.is_required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.dev_name, e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            required={field.is_required}
          >
            <option value="">Select...</option>
            {field.dropdown_options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.dev_name, e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            required={field.is_required}
          />
        );
      
      case 'tel':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleInputChange(field.dev_name, e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            required={field.is_required}
          />
        );
      
      case 'auto_complete':
        return (
          <input
            type="text"
            value={value}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.dev_name, e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            required={field.is_required}
          />
        );
    }
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
            {sections.map(section => (
              <div key={section} className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{section}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields
                    .filter(f => f.section === section && f.is_visible)
                    .map(field => (
                      <div key={field.dev_name} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {errors[field.dev_name] && (
                          <p className="text-red-500 text-xs mt-1">{errors[field.dev_name]}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Continue →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
