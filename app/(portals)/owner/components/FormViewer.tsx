'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FormViewerProps {
  clientId: string;
  formNumber: number;
  userRole: 'owner' | 'admin' | 'agent' | 'client';
  onClose: () => void;
  onSave?: () => void;
}

export default function FormViewer({ clientId, formNumber, userRole, onClose, onSave }: FormViewerProps) {
  const [formData, setFormData] = useState<any>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadFormData();
  }, [clientId, formNumber]);

  const loadFormData = async () => {
    setLoading(true);
    
    // For Form01, get data from form01_data
    if (formNumber === 1) {
      const { data } = await supabase
        .from('form01_data')
        .select('*')
        .eq('user_id', clientId)
        .single();
      setFormData(data);
      setRenderedHtml(renderForm01AsEditable(data));
    } else {
      // For Forms 02-22, get template and replace placeholders
      const { data: template } = await supabase
        .from('form_templates')
        .select('template_html')
        .eq('form_number', formNumber)
        .single();
      
      const { data: form01Data } = await supabase
        .from('form01_data')
        .select('*')
        .eq('user_id', clientId)
        .single();
      
      if (template && form01Data) {
        const rendered = replacePlaceholders(template.template_html, form01Data);
        setRenderedHtml(rendered);
        setFormData(form01Data);
      }
    }
    
    setLoading(false);
  };

  const renderForm01AsEditable = (data: any) => {
    // Create an editable form for Form01
    return `
      <div class="editable-form">
        <style>
          .editable-form { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; }
          .editable-form .form-section { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
          .editable-form .form-section h3 { margin-bottom: 15px; color: #1e3a8a; }
          .editable-form .form-row { display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
          .editable-form .form-group { flex: 1; min-width: 200px; }
          .editable-form label { display: block; font-size: 12px; font-weight: 500; color: #6b7280; margin-bottom: 4px; }
          .editable-form input, .editable-form select, .editable-form textarea { 
            width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; 
            font-size: 14px; transition: all 0.2s;
          }
          .editable-form input:focus, .editable-form select:focus { outline: none; border-color: #3b82f6; }
          .editable-form .readonly { background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; }
        </style>
        
        <div class="form-section">
          <h3>Personal Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" id="fn_t1" value="${data?.fn_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
            <div class="form-group">
              <label>Middle Name</label>
              <input type="text" id="mdn_t1" value="${data?.mdn_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
            <div class="form-group">
              <label>Surname</label>
              <input type="text" id="fln_t1" value="${data?.fln_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="user_email" value="${data?.user_email || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="cnt_1" value="${data?.cnt_1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Address Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Street Address</label>
              <input type="text" id="strn_t1" value="${data?.strn_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
            <div class="form-group">
              <label>Suburb</label>
              <input type="text" id="sbn_t1" value="${data?.sbn_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>City/Town</label>
              <input type="text" id="ctn_t1" value="${data?.ctn_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
            <div class="form-group">
              <label>Postal Code</label>
              <input type="text" id="ptc_t1" value="${data?.ptc_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Employment & Banking</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Employment Status</label>
              <select id="she_t1" ${userRole !== 'owner' ? 'disabled' : ''}>
                <option value="">Select</option>
                <option value="Employed" ${data?.she_t1 === 'Employed' ? 'selected' : ''}>Employed</option>
                <option value="Self-Employed" ${data?.she_t1 === 'Self-Employed' ? 'selected' : ''}>Self-Employed</option>
                <option value="Unemployed" ${data?.she_t1 === 'Unemployed' ? 'selected' : ''}>Unemployed</option>
                <option value="Retired" ${data?.she_t1 === 'Retired' ? 'selected' : ''}>Retired</option>
              </select>
            </div>
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="bctn_t1" value="${data?.bctn_t1 || ''}" ${userRole !== 'owner' ? 'readonly class="readonly"' : ''}>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const replacePlaceholders = (html: string, data: any): string => {
    let result = html;
    
    // Find all placeholders like {{field_name}}
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    result = result.replace(placeholderRegex, (match: string, fieldName: string) => {
      // Handle special cases
      if (fieldName === 'current_year') return new Date().getFullYear().toString();
      if (fieldName === 'current_month') return new Date().toLocaleString('default', { month: 'long' });
      if (fieldName === 'current_day') return new Date().getDate().toString();
      if (fieldName === 'sdy_t1') return new Date().getDate().toString();
      if (fieldName === 'smth_t1') return new Date().toLocaleString('default', { month: 'long' });
      
      // Handle concatenation (e.g., {{fn_t1 + ' ' + fln_t1}})
      if (fieldName.includes('+')) {
        const parts = fieldName.split('+').map((part: string) => part.trim().replace(/'/g, ''));
        return parts.map((part: string) => data[part] || part).join('');
      }
      
      return data[fieldName] || '';
    });
    
    return result;
  };

  const handleSave = async () => {
    if (userRole !== 'owner') return;
    
    setSaving(true);
    
    if (formNumber === 1) {
      // Collect updated values from the editable form
      const updatedData: any = {};
      const inputs = document.querySelectorAll('#form-viewer input, #form-viewer select, #form-viewer textarea');
      inputs.forEach((input: any) => {
        if (input.id) {
          updatedData[input.id] = input.value;
        }
      });
      
      const { error } = await supabase
        .from('form01_data')
        .update(updatedData)
        .eq('user_id', clientId);
      
      if (error) {
        alert('Error saving: ' + error.message);
      } else {
        alert('Form data saved successfully!');
        if (onSave) onSave();
      }
    }
    
    setSaving(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(renderedHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            Form {formNumber} {formNumber === 1 ? '- Client Data' : ''}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div id="form-viewer" className="flex-1 overflow-auto p-6">
          {formNumber === 1 && userRole === 'owner' ? (
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          )}
        </div>
        
        <div className="flex justify-between p-4 border-t bg-gray-50">
          <div>
            {/* Placeholder for unlock request button */}
          </div>
          <div className="flex gap-2">
            {userRole === 'owner' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
