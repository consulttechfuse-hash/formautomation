'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgentRankingChart() {
  const [data, setData] = useState<{ name: string; completion: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: agents } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'agent')
      .eq('admin_id', user.id);

    const stats = await Promise.all((agents || []).map(async (agent) => {
      const { data: clients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('agent_id', agent.id);

      const total = clients?.length || 0;
      const completed = clients?.filter(c => c.onboarding_submitted === true).length || 0;
      const completion = total > 0 ? (completed / total) * 100 : 0;

      return {
        name: agent.email.split('@')[0],
        completion: Math.round(completion),
      };
    }));

    setData(stats.sort((a, b) => b.completion - a.completion));
    setLoading(false);
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">Agent Ranking</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">No agents found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Agent Ranking by Completion</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} unit="%" />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
          <Bar dataKey="completion" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
