'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CompletionProgressBar() {
  const [completionRate, setCompletionRate] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [completedClients, setCompletedClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clients } = await supabase
      .from('users')
      .select('onboarding_submitted')
      .eq('role', 'client')
      .eq('agent_id', user.id);

    const total = clients?.length || 0;
    const completed = clients?.filter(c => c.onboarding_submitted === true).length || 0;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    setTotalClients(total);
    setCompletedClients(completed);
    setCompletionRate(Math.round(rate));
    setLoading(false);
  };

  if (loading) return <div className="h-32 flex items-center justify-center">Loading...</div>;

  if (totalClients === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">Overall Progress</h3>
        <div className="h-24 flex items-center justify-center text-gray-500">No clients assigned yet</div>
      </div>
    );
  }

  const getColor = () => {
    if (completionRate >= 70) return 'bg-green-600';
    if (completionRate >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Overall Progress</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Completed: {completedClients} of {totalClients} clients</span>
          <span className="font-bold">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className={`${getColor()} rounded-full h-3 transition-all duration-500`} style={{ width: `${completionRate}%` }} />
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          {completionRate >= 70 ? 'Great progress!' : completionRate >= 40 ? 'Keep going!' : 'Start working on your clients'}
        </p>
      </div>
    </div>
  );
}
