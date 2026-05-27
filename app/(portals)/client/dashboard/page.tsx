"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }
      
      // Check user's role from user_roles table
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();
      
      const role = userRole?.role;
      
      // If user is not a client, redirect to their correct dashboard
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
      
      // Only clients should see this page
      if (role !== 'client') {
        console.warn(`User ${authUser.email} with role ${role} attempted to access client dashboard`);
        router.push('/unauthorized');
        return;
      }
      
      setUser(authUser);
      setLoading(false);
    };
    
    checkAccess();
  }, [router, supabase]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      {/* Rest of your client dashboard content */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
