'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AddFieldModal from './AddFieldModal';

export default function FormViewer({ formData, formNumber, clientEmail, showEditButton = false, showAddField = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(formData);
  const [saving, setSaving] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    const { data } = await supabase
      .from('form_custom_fields')
      .select('*')
      .order('created_at', { ascending: true });
    setCustomFields(data || []);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('form01_data')
        .update(editData)
        .eq('id', formData.id);
      
      if (error) throw error;
      
      alert('Form saved successfully!');
      setIsEditing(false);
    } catch (error) {
      alert('Error saving form: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(formData);
    setIsEditing(false);
  };

  const handleFieldAdded = (newField) => {
    loadCustomFields();
    setEditData({ ...editData, [newField.fieldName]: '' });
  };

  // Helper to render edit field or display value with unique key
  const renderField = (label, fieldName, value, type = 'TEXT', keyIndex) => {
    if (isEditing) {
      if (type === 'TEXTAREA') {
        return (
          <div key={fieldName + '_' + keyIndex}>
            <label className="text-sm text-gray-500">{label}</label>
            <textarea
              value={value || ''}
              onChange={(e) => setEditData({ ...editData, [fieldName]: e.target.value })}
              className="w-full border rounded p-2 mt-1"
              rows={3}
            />
          </div>
        );
      }
      return (
        <div key={fieldName + '_' + keyIndex}>
          <label className="text-sm text-gray-500">{label}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setEditData({ ...editData, [fieldName]: e.target.value })}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
      );
    }
    return (
      <div key={fieldName + '_' + keyIndex}>
        <label className="text-sm text-gray-500">{label}</label>
        <p className="font-medium">{value || 'N/A'}</p>
      </div>
    );
  };

  // Form-01
  if (formNumber === 1 || formNumber === '1') {
    // Define standard fields with their labels
    const standardFields = [
      { label: 'First Name', name: 'fn_t1', type: 'TEXT' },
      { label: 'Middle Name', name: 'mdn_t1', type: 'TEXT' },
      { label: 'Surname', name: 'fln_t1', type: 'TEXT' },
      { label: 'Full Name', name: 'fln_t5', type: 'TEXT' },
      { label: 'Previous Surnames', name: 'prev_surnames', type: 'TEXTAREA' },
      { label: 'Email Address', name: 'user_email', type: 'TEXT' },
      { label: 'Mobile Number', name: 'cnt_1', type: 'TEXT' },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded sticky top-0 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-lg mb-2">Form-01: National Information</h3>
            <p className="text-sm text-gray-600">Client: {clientEmail}</p>
          </div>
          <div className="flex gap-2">
            {showEditButton && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ✏️ Edit Form
              </button>
            )}
            {showAddField && (
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                ➕ Add Field
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Section 1: National Naming Information */}
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">N1.1 - National Naming Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standardFields.slice(0, 5).map((field, idx) => (
                renderField(field.label, field.name, editData[field.name], field.type, idx)
              ))}
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">N1.3 - Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standardFields.slice(5, 7).map((field, idx) => (
                renderField(field.label, field.name, editData[field.name], field.type, idx + 10)
              ))}
            </div>
          </div>

          {/* Section: Other Information - Custom Fields */}
          {customFields.length > 0 && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-purple-700 border-b pb-2">N1.1 Other Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((field, idx) => (
                  renderField(field.field_label, field.field_name, editData[field.field_name], field.field_type === 'TEXTAREA' ? 'TEXTAREA' : 'TEXT', idx + 100)
                ))}
              </div>
            </div>
          )}
        </div>

        {showAddFieldModal && (
          <AddFieldModal onClose={() => setShowAddFieldModal(false)} onFieldAdded={handleFieldAdded} />
        )}
      </div>
    );
  }

  // Forms 2-17
  if (formData.filled_html) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded sticky top-0">
          <h3 className="font-bold text-lg">Form {formNumber.toString().padStart(2, '0')}</h3>
          <p className="text-sm text-gray-600">Client: {clientEmail}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div dangerouslySetInnerHTML={{ __html: formData.filled_html }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 p-4 rounded">
      <p className="text-sm">No form data available</p>
    </div>
  );
}
