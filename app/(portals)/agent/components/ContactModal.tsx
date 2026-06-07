'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientEmail: string;
  clientName: string;
  onSuccess: () => void;
}

export default function ContactModal({ isOpen, onClose, clientEmail, clientName, onSuccess }: ContactModalProps) {
  const [subject, setSubject] = useState('GEFE Form Automation Services');
  const [message, setMessage] = useState(`Dear {client_name},

We hope this message finds you well.

We noticed your application with Techfuse DocControl is pending action. Please log in to complete your application.

If you need any assistance, please don't hesitate to reach out.

Regards,
{agent_name}`);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        setError('File type not allowed. Please upload PDF, DOC, DOCX, JPG, or PNG.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Max size 5MB.');
        return;
      }
      
      setAttachment(file);
      setError(null);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSending(true);
    setError(null);

    let attachmentData = null;
    if (attachment) {
      const reader = new FileReader();
      const base64Content = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(attachment);
      });
      attachmentData = {
        filename: attachment.name,
        content: base64Content,
      };
    }

    const response = await fetch('/api/agent/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: clientEmail,
        subject,
        message,
        clientName,
        attachment: attachmentData,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setAttachment(null);
        setSubject('GEFE Form Automation Services');
      }, 2000);
    } else {
      setError(data.error || 'Failed to send email');
    }

    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Contact Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">Email Sent Successfully!</h3>
            <p className="text-gray-600">Your message has been sent to {clientEmail}.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="email" value={clientEmail} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={10} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-1">Use {'{client_name}'} and {'{agent_name}'} as placeholders.</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional, max 5MB)</label>
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full border rounded-lg px-3 py-2" />
              {attachment && <p className="text-xs text-green-600 mt-1">Selected: {attachment.name}</p>}
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <div className="flex gap-3">
              <button onClick={handleSend} disabled={sending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {sending ? 'Sending...' : 'Send Email'}
              </button>
              <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
