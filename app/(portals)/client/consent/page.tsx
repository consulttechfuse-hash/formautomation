'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSASTISOString } from '@/lib/timezone';

export default function ConsentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });
  const [typedName, setTypedName] = useState('');
  const [consented, setConsented] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
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

    // Check if already consented
    const { data: existingConsent } = await supabase
      .from('client_consent')
      .select('consented')
      .eq('client_id', user.id)
      .single();

    if (existingConsent?.consented) {
      setHasConsented(true);
      // Check flow state to see if step 3 is completed
      const { data: flowState } = await supabase
        .from('client_flow_state')
        .select('step_3_consent_completed')
        .eq('client_id', user.id)
        .single();
      
      if (flowState?.step_3_consent_completed) {
        router.push('/client/select-admin');
        return;
      }
    }

    // Get user data from user_roles
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('first_name, last_name, email, phone_number')
      .eq('user_id', user.id)
      .single();

    if (userRole) {
      setUserData({
        first_name: userRole.first_name || '',
        last_name: userRole.last_name || '',
        email: userRole.email || '',
        phone_number: userRole.phone_number || ''
      });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consented) {
      setError('You must consent to continue');
      return;
    }

    // Exact name match validation
    const fullName = `${userData.first_name} ${userData.last_name}`.trim().toLowerCase();
    const typedNameClean = typedName.trim().toLowerCase();
    
    if (fullName !== typedNameClean) {
      setError('The name you typed does not match your registered name. Please type your full name exactly as registered.');
      return;
    }

    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired');
      setSaving(false);
      return;
    }

    const ipAddress = window.clientInformation?.userAgent || 'unknown';
    const sastTimestamp = getSASTISOString();

    // Save consent
    const { error: consentError } = await supabase
      .from('client_consent')
      .insert({
        client_id: user.id,
        consent_text: 'Consent declaration agreed',
        typed_name: typedName.trim(),
        consented: true,
        consented_at: sastTimestamp,
        ip_address: ipAddress,
        user_agent: navigator.userAgent
      });

    if (consentError) {
      setError(consentError.message);
      setSaving(false);
      return;
    }

    // Update client_flow_state
    await supabase
      .from('client_flow_state')
      .update({
        step_3_consent_completed: true,
        current_step: 4,
        updated_at: sastTimestamp
      })
      .eq('client_id', user.id);

    router.push('/client/select-admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasConsented) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Already Consented</h1>
          <p className="text-gray-600 mb-6">You have already completed the consent declaration.</p>
          <button
            onClick={() => router.push('/client/select-admin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continue to Admin Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Consent & Declaration</h1>
            <p className="text-blue-100 mt-1">Please read carefully and provide your consent</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Your Information Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium">{userData.first_name} {userData.last_name}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium">{userData.email}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{userData.phone_number}</span></div>
              </div>
            </div>

            {/* Consent Text */}
            <div className="border rounded-lg p-6 max-h-96 overflow-y-auto bg-white">
              <h2 className="text-xl font-bold text-center mb-4">CONSENT DECLARATION</h2>
              
              <p className="mb-4">I, the undersigned, hereby voluntarily and freely give my consent as set out below.</p>

              <h3 className="font-semibold mt-4 mb-2">1. Voluntary Participation</h3>
              <p className="text-gray-700 mb-3">I am voluntarily and freely embarking on the Form completion process offered by the Party. I understand that my participation is entirely voluntary, and I have not been coerced, induced, or subjected to any undue influence to participate.</p>

              <h3 className="font-semibold mt-4 mb-2">2. Consent to Processing of Personal Information</h3>
              <p className="text-gray-700 mb-3">I hereby consent to the collection, receipt, recording, organisation, storage, retrieval, use, sharing, transmission, dissemination, and otherwise processing of my personal information (including any special personal information) by the Party, its founders, staff, volunteers, administrators (including provincial administrators), systems, platforms, operators, and any other persons or organisations assisting me in the Form completion process.</p>

              <h3 className="font-semibold mt-4 mb-2">3. Purpose of Processing</h3>
              <p className="text-gray-700 mb-3">I acknowledge and agree that my personal information will be processed for the sole purpose of assisting me with the Form completion steps, procedures, and processes, including but not limited to:</p>
              <ul className="list-disc pl-6 mb-3 text-gray-700">
                <li>Verifying my identity and eligibility;</li>
                <li>Facilitating communication between myself and the relevant administrators, staff, and volunteers;</li>
                <li>Maintaining records of my Form completion journey;</li>
                <li>Sharing information with authorised parties as necessary to complete the Form completion steps.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4. Disclosure and Sharing of Information</h3>
              <p className="text-gray-700 mb-3">I understand and agree that my personal information may be shared with:</p>
              <ul className="list-disc pl-6 mb-3 text-gray-700">
                <li>The Coordinators and Admins;</li>
                <li>Third-party platforms, systems, and operators used to facilitate the Form Completion process;</li>
                <li>Any other person or organisation reasonably required to assist in my Form completion process.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">5. Acknowledgment of Risks and Liability</h3>
              <p className="text-gray-700 mb-3">I acknowledge that I have read, understood, and agree to the limitations of liability set out in Section 4 of these Terms and Conditions. I understand that while the Party will take appropriate, reasonable technical and organisational measures to safeguard my personal information as required by the Protection of Personal Information Act (POPIA), no security measures are impenetrable, and I assume the inherent risks associated with the processing of my personal information in a digital environment.</p>

              <h3 className="font-semibold mt-4 mb-2">6. Acknowledgment of Rights</h3>
              <p className="text-gray-700 mb-3">I confirm that I have been informed of my rights as a data subject under the Protection of Personal Information Act (POPIA), including:</p>
              <ul className="list-disc pl-6 mb-3 text-gray-700">
                <li>The right to request access to my personal information held by the Party;</li>
                <li>The right to request the correction or deletion of inaccurate, irrelevant, excessive, or outdated personal information;</li>
                <li>The right to object, on reasonable grounds, to the processing of my personal information;</li>
                <li>The right to withdraw this consent at any time.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">7. Withdrawal of Consent</h3>
              <p className="text-gray-700 mb-3">I understand that I may withdraw my consent at any time by providing written notice to my Coordinator. I acknowledge that withdrawal of consent may impact the party's ability to continue providing Form completion services to me, and such withdrawal shall not affect the lawfulness of processing based on consent before its withdrawal.</p>

              <h3 className="font-semibold mt-4 mb-2">8. Duration of Consent</h3>
              <p className="text-gray-700 mb-3">This consent shall remain valid for the duration of my participation in the Form completion process and for such period thereafter as may be necessary to comply with legal, regulatory, or record-keeping obligations.</p>

              <h3 className="font-semibold mt-4 mb-2">9. Confirmation of Truthfulness</h3>
              <p className="text-gray-700 mb-3">I confirm that all information I have provided and will provide to Forms Completion is true, accurate, and complete to the best of my knowledge.</p>

              <p className="text-gray-700 mt-4"><strong>Techfuse Consulting</strong> is an Operating Service for Techfuse Holdings (Pty) Ltd</p>
              <p className="text-gray-700">Email: queries@techfuseconsult.online / techfuse.holdings@gmail.com</p>
            </div>

            {/* Type Name to Confirm */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type your full name to confirm consent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder={`${userData.first_name} ${userData.last_name}`}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Must match exactly: {userData.first_name} {userData.last_name}</p>
            </div>

            {/* Consent Checkbox */}
            <div className="border-t pt-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  I confirm that all information I have provided is true, accurate, and complete to the best of my knowledge.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                disabled={saving || !consented || !typedName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'I Consent →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
