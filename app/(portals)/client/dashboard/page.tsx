"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }
      
      // Try to get role from user_roles table
      let { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();
      
      let role = userRole?.role;
      
      // If no role in user_roles, check users table
      if (!role) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();
        role = profile?.role;
      }
      
      // If still no role, assume client (new user)
      if (!role) {
        role = 'client';
        // Create user_roles record for this user
        await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.id,
            email: authUser.email,
            role: 'client',
            has_consented: false,
            onboarding_complete: false,
            onboarding_submitted: false,
            has_paid: false,
            created_at: new Date().toISOString(),
          });
      }
      
      // Redirect based on role
      if (role === 'owner') {
        router.push('/owner/dashboard');
        return;
      }
      if (role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }
      if (role === 'agent') {
        router.push('/agent/dashboard');
        return;
      }
      
      // Get user progress
      const { data: userProgress } = await supabase
        .from('user_roles')
        .select('has_consented, onboarding_complete, onboarding_submitted, has_paid, assigned_admin_id')
        .eq('user_id', authUser.id)
        .single();
      
      setProgress(userProgress);
      setUser(authUser);
      setLoading(false);
    };
    
    checkAccess();
  }, [router, supabase]);

  const steps = [
    { id: 1, name: 'Sign up', path: null, completed: true },
    { id: 2, name: 'Sign in', path: null, completed: true },
    { id: 3, name: 'Consent & Declaration', path: '/client/consent', completed: progress?.has_consented === true },
    { id: 4, name: 'Choose Your National Admin', path: '/client/select-admin', completed: progress?.assigned_admin_id !== null },
    { id: 5, name: 'Make Payment', path: '/client/select-payment', completed: progress?.has_paid === true },
    { id: 6, name: 'Complete Form-01', path: '/client/form-01', completed: progress?.onboarding_complete === true },
    { id: 7, name: 'Form Check & Submit', path: '/forms/check-submit', completed: progress?.onboarding_submitted === true },
  ];

  const currentStep = steps.find(step => step.completed === false && step.path !== null);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-primary text-primary-foreground p-4 mb-8 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Techfuse DocControl</h1>
          <p className="text-primary-foreground/80 mt-1">Follow the steps below to complete your application.</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`border rounded-lg p-4 flex justify-between items-center ${
              step.completed ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}
          >
            <div>
              <h3 className="font-semibold text-lg">{step.name}</h3>
              {step.completed && <p className="text-sm text-green-600">✓ Completed</p>}
            </div>
            {!step.completed && step.path && (
              <button
                onClick={() => router.push(step.path)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Start
              </button>
            )}
          </div>
        ))}
      </div>

      {currentStep && (
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-primary">
            <strong>Next step:</strong> {currentStep.name}
          </p>
        </div>
      )}
    </div>
  );
}
