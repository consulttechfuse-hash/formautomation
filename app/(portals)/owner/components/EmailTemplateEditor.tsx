'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Template {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    key: '',
    name: '',
    subject: '',
    body: '',
    description: '',
    is_locked: false
  });
  const supabase = createClient();

  // Sample data for preview
  const sampleData = {
    client_name: 'John Doe',
    client_email: 'john@example.com',
    agent_name: 'Jane Smith',
    admin_name: 'Admin User',
    form_link: 'https://techfuseconsult.online/client/forms',
    payment_link: 'https://techfuseconsult.online/client/select-payment',
    unlock_link: 'https://techfuseconsult.online/client/unlock',
    support_email: 'support@techfuseconsult.online',
    company_name: 'Techfuse DocControl'
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const response = await fetch('/api/owner/templates');
    const data = await response.json();
    
    if (data.success) {
      setTemplates(data.templates);
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to load templates' });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    const response = await fetch('/api/owner/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedTemplate)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessage({ type: 'success', text: 'Template saved successfully' });
      setEditing(false);
      await loadTemplates();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to save template' });
    }
    setSaving(false);
  };

  const handleToggleLock = async () => {
    if (!selectedTemplate) return;
    
    const response = await fetch('/api/owner/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedTemplate.id,
        is_locked: !selectedTemplate.is_locked
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setSelectedTemplate({ ...selectedTemplate, is_locked: !selectedTemplate.is_locked });
      await loadTemplates();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"? This cannot be undone.`)) return;
    
    const response = await fetch(`/api/owner/templates?id=${id}`, { method: 'DELETE' });
    const data = await response.json();
    
    if (data.success) {
      setMessage({ type: 'success', text: 'Template deleted successfully' });
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
      await loadTemplates();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to delete template' });
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.key || !newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    
    setSaving(true);
    const response = await fetch('/api/owner/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTemplate)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessage({ type: 'success', text: 'Template created successfully' });
      setShowCreateModal(false);
      setNewTemplate({ key: '', name: '', subject: '', body: '', description: '', is_locked: false });
      await loadTemplates();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to create template' });
    }
    setSaving(false);
  };

  const renderPreview = (template: Template) => {
    let preview = template.body;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return preview;
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-gray-500 mt-1">Manage email templates used across the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create New Template
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Template List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Template List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-3 bg-gray-50 border-b">
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                // Filtering handled in render
              }}
            />
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setEditing(false);
                  setShowPreview(false);
                }}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTemplate?.id === template.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500 truncate">{template.key}</div>
                  </div>
                  {template.is_locked && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">🔒 Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          {selectedTemplate ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-500">Key: {selectedTemplate.key}</p>
                </div>
                <div className="flex gap-2">
                  {!selectedTemplate.is_locked && !editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                  {!editing && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>
                  )}
                  <button
                    onClick={handleToggleLock}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedTemplate.is_locked
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {selectedTemplate.is_locked ? '🔓 Unlock' : '🔒 Lock'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedTemplate.id, selectedTemplate.name)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedTemplate.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {selectedTemplate.description}
                </div>
              )}

              {editing && !selectedTemplate.is_locked ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                    <textarea
                      value={selectedTemplate.body}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                      rows={12}
                      className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-medium mb-1">Available placeholders:</p>
                      <div className="flex flex-wrap gap-2">
                        <code className="bg-gray-100 px-1 rounded">{'{client_name}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{client_email}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{agent_name}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{admin_name}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{form_link}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{payment_link}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{support_email}'}</code>
                        <code className="bg-gray-100 px-1 rounded">{'{company_name}'}</code>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : showPreview ? (
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                    <div className="text-xs text-gray-500 mb-2">Subject: {selectedTemplate.subject}</div>
                    <hr className="my-2" />
                    {renderPreview(selectedTemplate)}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <div className="p-3 bg-gray-50 rounded-lg">{selectedTemplate.subject}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                    <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                      {selectedTemplate.body}
                    </div>
                  </div>
                  {selectedTemplate.is_locked && (
                    <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                      🔒 This template is locked. Unlock to edit.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              Select a template from the list to edit
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key (unique identifier) *</label>
                <input
                  type="text"
                  value={newTemplate.key}
                  onChange={(e) => setNewTemplate({ ...newTemplate, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., custom_follow_up"
                />
                <p className="text-xs text-gray-500 mt-1">Use lowercase letters, numbers, and underscores only</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Custom Follow Up"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
                <textarea
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  rows={10}
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                />
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-medium mb-1">Available placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    <code className="bg-gray-100 px-1 rounded">{'{client_name}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{client_email}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{agent_name}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{admin_name}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{form_link}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{payment_link}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{support_email}'}</code>
                    <code className="bg-gray-100 px-1 rounded">{'{company_name}'}</code>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="What is this template used for?"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_locked"
                  checked={newTemplate.is_locked}
                  onChange={(e) => setNewTemplate({ ...newTemplate, is_locked: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_locked" className="text-sm text-gray-700">Lock this template (prevents edits)</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Template'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
