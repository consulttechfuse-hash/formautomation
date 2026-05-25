'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function FormManagement() {
  const [selectedForm, setSelectedForm] = useState('');
  const [templateData, setTemplateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editHtml, setEditHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const forms = [
    { value: 'form01_data', label: 'FORM 01 - Master Data', type: 'data', isMaster: true },
    { value: 'form02', label: 'FORM 02 - Template', type: 'template' },
    { value: 'form03', label: 'FORM 03 - Template', type: 'template' },
    { value: 'form04', label: 'FORM 04 - Template', type: 'template' },
    { value: 'form05', label: 'FORM 05 - Template', type: 'template' },
    { value: 'form06', label: 'FORM 06 - Template', type: 'template' },
    { value: 'form07', label: 'FORM 07 - Template', type: 'template' },
    { value: 'form08', label: 'FORM 08 - Template', type: 'template' },
    { value: 'form09', label: 'FORM 09 - Template', type: 'template' },
    { value: 'form10', label: 'FORM 10 - Template', type: 'template' },
    { value: 'form11', label: 'FORM 11 - Template', type: 'template' },
    { value: 'form12', label: 'FORM 12 - Template', type: 'template' },
    { value: 'form13', label: 'FORM 13 - Template', type: 'template' },
    { value: 'form14', label: 'FORM 14 - Template', type: 'template' },
    { value: 'form15', label: 'FORM 15 - Template', type: 'template' },
    { value: 'form16', label: 'FORM 16 - Template', type: 'template' },
    { value: 'form17', label: 'FORM 17 - Template', type: 'template' },
  ];

  const loadTemplate = async () => {
    if (!selectedForm) return;
    setLoading(true);
    
    const formNum = parseInt(selectedForm.replace('form', ''));
    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('form_number', formNum)
      .single();
    
    if (data) {
      setTemplateData(data);
      setEditHtml(data.template_html || '');
    } else if (error && error.code === 'PGRST116') {
      setTemplateData(null);
      setEditHtml('<h1>Form Template</h1><p>Edit this template...</p>');
    } else {
      console.error('Error loading template:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTemplate();
    setEditMode(false);
  }, [selectedForm]);

  const handleSave = async () => {
    setSaving(true);
    const formNum = parseInt(selectedForm.replace('form', ''));
    
    try {
      if (templateData) {
        const { error } = await supabase
          .from('form_templates')
          .update({ template_html: editHtml })
          .eq('form_number', formNum);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('form_templates')
          .insert({
            form_number: formNum,
            template_html: editHtml,
            created_at: new Date()
          });
        
        if (error) throw error;
      }
      
      alert(`Form ${formNum} template saved successfully!`);
      setEditMode(false);
      loadTemplate();
    } catch (error) {
      alert('Error saving template: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const selectedFormObj = forms.find(f => f.value === selectedForm);
  const isTemplate = selectedFormObj?.type === 'template';

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Form Management</h2>
      
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Select Form</label>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">-- Select a Form --</option>
          {forms.map(form => (
            <option key={form.value} value={form.value}>{form.label}</option>
          ))}
        </select>

        {loading && <div className="text-center py-4">Loading...</div>}

        {!loading && selectedForm && isTemplate && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Template Editor</h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  ✏️ Edit Template
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditHtml(templateData?.template_html || '');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {editMode ? (
              <div className="border rounded-lg p-4">
                <textarea
                  value={editHtml}
                  onChange={(e) => setEditHtml(e.target.value)}
                  className="w-full h-96 font-mono text-sm p-4 border rounded"
                  placeholder="Enter HTML template here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use {'{{'}field_name{'}}'} placeholders to pull data from Form-01. Example: {'{{'}fn_t1{'}}'}, {'{{'}user_email{'}}'}, {'{{'}cnt_1{'}}'}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="max-h-96 overflow-auto">
                  {templateData?.template_html ? (
                    <div className="bg-gray-50 p-4 rounded">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {templateData.template_html}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded text-center text-yellow-700">
                      No template found. Click "Edit Template" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && selectedForm && selectedForm === 'form01_data' && (
          <div className="mt-4">
            <div className="bg-yellow-50 p-4 rounded text-center text-yellow-700">
              📝 Form-01 is a data form, not an HTML template. Use the Client Management section to view/edit client data.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
