'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AddFieldModal({ onClose, onFieldAdded }) {
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const generateFieldName = (label: string) => {
    // Convert label to lowercase, replace spaces with underscores, remove special chars
    let name = label.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    // Limit to 50 characters
    if (name.length > 50) name = name.substring(0, 50);
    return name;
  };

  const handleLabelChange = (value: string) => {
    setFieldLabel(value);
    if (!fieldName) {
      setFieldName(generateFieldName(value));
    }
  };

  const handleAddField = async () => {
    if (!fieldLabel || !fieldName) {
      setError('Please enter both label and field name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add column to form01_data table
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE form01_data ADD COLUMN IF NOT EXISTS "${fieldName}" ${fieldType};`
      });

      if (sqlError) throw new Error(sqlError.message);

      // Also store the field metadata somewhere (optional - could use a separate table)
      const { error: insertError } = await supabase
        .from('form_custom_fields')
        .insert({
          field_name: fieldName,
          field_label: fieldLabel,
          field_type: fieldType,
          section: 'other_info'
        });

      if (insertError && insertError.code !== '42P01') {
        // Table might not exist yet
        console.log('Metadata storage skipped - table not created yet');
      }

      alert(`Field "${fieldLabel}" added successfully!`);
      onFieldAdded({ fieldName, fieldLabel, fieldType });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Add New Field to Form-01</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Field Label (e.g., "Mother's Sister Name")</label>
            <input
              type="text"
              value={fieldLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Enter display label"
              className="w-full border rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Database Field Name (e.g., "mother_sister_name")</label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="auto-generated from label"
              className="w-full border rounded p-2"
            />
            <p className="text-xs text-gray-500 mt-1">Use lowercase letters and underscores only</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Field Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="TEXT">Text (short)</option>
              <option value="TEXT">Text Area (long)</option>
              <option value="INTEGER">Number</option>
              <option value="DATE">Date</option>
              <option value="BOOLEAN">Yes/No</option>
            </select>
          </div>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={handleAddField} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Adding...' : 'Add Field'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
