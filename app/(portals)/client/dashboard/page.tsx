'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FileText, Download, Eye } from 'lucide-react';
import RequestModal from '../components/RequestModal';

interface FlowState {
  id: string;
  client_id: string;
  current_step: number;
  step_1_admin_selected: boolean;
  step_2_payment_completed: boolean;
  step_3_consent_completed: boolean;
  step_4_form01_completed: boolean;
  step_5_form_submitted: boolean;
  step_6_completed: boolean;
  lock_type: string;
  locked_step: number;
  locked_reason: string;
  created_at?: string;
}

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [flowState, setFlowState] = useState<FlowState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showViewForms, setShowViewForms] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'change_admin' | 'unlock_form01' | null>(null);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadFlowState();
  }, []);

  const loadFlowState = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get consent date
    const { data: consent } = await supabase
      .from('client_consent')
      .select('consented_at')
      .eq('client_id', user.id)
      .single();

    if (consent?.consented_at) {
      setConsentDate(consent.consented_at);
    }

    const response = await fetch('/api/client/flow');
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to load your progress');
      setLoading(false);
      return;
    }

    if (data.flowStates && data.flowStates.length > 0) {
      setFlowState(data.flowStates[0]);
    } else {
      const { data: newFlow, error: createError } = await supabase
        .from('client_flow_state')
        .insert({
          client_id: user.id,
          current_step: 3,
          lock_type: 'unlocked',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!createError && newFlow) {
        setFlowState(newFlow);
      }
    }

    setLoading(false);
  };

  const handleStepClick = async (stepId: number, path: string) => {
    if (!flowState) return;

    if (flowState.lock_type === 'locked_permanent') {
      if (stepId === 6 && flowState.step_6_completed) {
        setShowViewForms(true);
      } else {
        setError('This application is locked. Contact owner for assistance.');
      }
      return;
    }

    if (flowState.lock_type === 'locked_step' && flowState.locked_step === stepId) {
      setError(`Step ${stepId} is locked. An unlock request has been submitted.`);
      return;
    }

    const canAccess = await checkPrerequisites(stepId);
    if (!canAccess) {
      setError('Please complete previous steps first.');
      return;
    }

    router.push(path);
  };

  const checkPrerequisites = async (stepId: number): Promise<boolean> => {
    if (!flowState) return false;
    
    switch (stepId) {
      case 3: return true;
      case 4: return flowState.step_3_consent_completed === true;
      case 2: return flowState.step_1_admin_selected === true;
      case 5: return flowState.step_2_payment_completed === true;
      case 6: return flowState.step_5_form_submitted === true;
      default: return false;
    }
  };

  const openRequestModal = (type: 'change_admin' | 'unlock_form01') => {
    setRequestType(type);
    setShowRequestModal(true);
  };

  const [adminName, setAdminName] = useState('');
  useEffect(() => {
    const getAdminName = async () => {
      if (flowState?.step_1_admin_selected) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: client } = await supabase
            .from('user_roles')
            .select('assigned_admin_id')
            .eq('user_id', user.id)
            .single();
          
          if (client?.assigned_admin_id) {
            const { data: admin } = await supabase
              .from('user_roles')
              .select('first_name, last_name')
              .eq('user_id', client.assigned_admin_id)
              .single();
            
            if (admin) {
              setAdminName(`${admin.first_name} ${admin.last_name}`);
            }
          }
        }
      }
    };
    getAdminName();
  }, [flowState]);

  const steps = [
    { id: 3, name: 'Consent & Declaration', path: '/client/consent', completed: flowState?.step_3_consent_completed || false, locked: false, description: 'Review and accept consent terms' },
    { id: 4, name: 'Select Admin', path: '/client/select-admin', completed: flowState?.step_1_admin_selected || false, locked: !flowState?.step_3_consent_completed, warning: '⚠️ Please ensure you select the correct administrator. You are only allowed 1 admin change request.' },
    { id: 2, name: 'Make Payment', path: '/client/select-payment', completed: flowState?.step_2_payment_completed || false, locked: !flowState?.step_1_admin_selected, paymentNote: adminName ? `💰 You are about to make payment to ${adminName}. Please ensure this is correct.` : '💰 Please complete your payment to proceed.' },
    { id: 5, name: 'Complete Forms 01-17', path: '/client/form01', completed: flowState?.step_4_form01_completed || false, locked: !flowState?.step_2_payment_completed, description: 'Complete all application forms' },
    { id: 6, name: 'Confirm & Submit', path: '/client/confirm-submit', completed: flowState?.step_6_completed || false, locked: !flowState?.step_5_form_submitted, description: 'Final review and submission' },
  ];

  const isForm01Locked = flowState?.step_4_form01_completed === true && flowState?.lock_type !== 'overridden';
  const isStep1Locked = flowState?.step_1_admin_selected === true;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Application Progress</h1>
          <div className="flex gap-3">
            {flowState?.step_6_completed && (
              <button
                onClick={() => setShowViewForms(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" /> View My Forms
              </button>
            )}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Steps */}
          <div className="flex-1">
            <p className="text-gray-600 mb-8">Complete all steps to submit your application</p>
            
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.completed ? '✓' : step.id === 3 ? '1' : step.id === 4 ? '2' : step.id === 2 ? '3' : step.id === 5 ? '4' : '5'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{step.name}</h3>
                        {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
                        {step.warning && !step.completed && step.locked && (
                          <p className="text-sm text-amber-600 mt-1">{step.warning}</p>
                        )}
                        {step.paymentNote && !step.completed && step.id === 2 && !step.locked && (
                          <p className="text-sm text-blue-600 mt-1">{step.paymentNote}</p>
                        )}
                        {step.completed && <p className="text-sm text-green-600 mt-1">Complete</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStepClick(step.id, step.path)}
                      disabled={step.locked}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        step.completed 
                          ? 'bg-gray-100 text-gray-500 cursor-default'
                          : step.locked 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {step.completed ? 'Completed' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
              <div className="space-y-2">
                {isStep1Locked && (
                  <button
                    onClick={() => openRequestModal('change_admin')}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg">🔄</span>
                    <span>Request Admin Change</span>
                  </button>
                )}
                {isForm01Locked && (
                  <button
                    onClick={() => openRequestModal('unlock_form01')}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg">🔓</span>
                    <span>Request Form-01 Unlock</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3 border-t pt-3">
                You have 1 request available for each type.
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* View Forms Modal */}
      {showViewForms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Forms</h2>
              <button onClick={() => setShowViewForms(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Consent Declaration</span>
                    <p className="text-sm text-gray-500">Signed on {consentDate ? new Date(consentDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">View</button>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Form-01: Application Form</span>
                    <p className="text-sm text-gray-500">{flowState?.step_4_form01_completed ? 'Completed' : 'Not started'}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">View</button>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Forms 02-17</span>
                    <p className="text-sm text-gray-500">{flowState?.step_5_form_submitted ? 'Submitted' : 'Pending'}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">View All</button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download as PDF
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" /> Download as DOCX
              </button>
              <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download ZIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      <RequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setRequestType(null);
        }}
        requestType={requestType}
        onSuccess={() => {
          loadFlowState();
        }}
      />
    </div>
  );
}
