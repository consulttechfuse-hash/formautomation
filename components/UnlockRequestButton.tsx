'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UnlockRequestButtonProps {
  clientId: string;
  formNumber: number;
  isLocked: boolean;
  onRequestSent?: () => void;
}

export default function UnlockRequestButton({ clientId, formNumber, isLocked, onRequestSent }: UnlockRequestButtonProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const supabase = createClient();

  if (!isLocked) return null;

  const handleRequestUnlock = async () => {
    const reason = prompt('Please provide a reason for requesting this form to be unlocked:');
    if (!reason) return;

    setIsRequesting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('unlock_requests')
      .insert({
        client_id: clientId,
        form_number: formNumber,
        requested_by: user?.id,
        reason: reason,
        status: 'pending'
      });

    if (error) {
      alert('Error submitting request: ' + error.message);
    } else {
      setRequestSent(true);
      alert('Unlock request submitted. Admin will review it shortly.');
      if (onRequestSent) onRequestSent();
    }

    setIsRequesting(false);
  };

  if (requestSent) {
    return (
      <div className="text-sm text-green-600">
        ✓ Unlock request sent to admin
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestUnlock}
      disabled={isRequesting}
      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
    >
      {isRequesting ? 'Submitting...' : '🔓 Request Unlock'}
    </button>
  );
}
