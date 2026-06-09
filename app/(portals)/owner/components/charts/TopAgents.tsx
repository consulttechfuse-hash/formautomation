'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentData {
  name: string;
  completion: number;
  clients: number;
}

export default function TopAgentsChart() {
  const [data, setData] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: agents } = await supabase
      .from('user_roles')
      .select('user_id, email, first_name, last_name')
      .eq('role', 'agent');

    const stats = await Promise.all((agents || []).map(async (agent) => {
      const { data: clients } = await supabase
        .from('user_roles')
        .select('has_paid, onboarding_submitted')
        .eq('role', 'client')
        .eq('assigned_agent_id', agent.user_id);

      const total = clients?.length || 0;
      const completed = clients?.filter(c => c.onboarding_submitted === true).length || 0;
      const completion = total > 0 ? (completed / total) * 100 : 0;

      const agentName = agent.first_name || agent.email.split('@')[0];
      return {
        name: agentName,
        completion: Math.round(completion),
        clients: total,
      };
    }));

    const top5 = stats.sort((a, b) => b.completion - a.completion).slice(0, 5);
    setData(top5);
    setLoading(false);
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">Top 5 Agents by Completion Rate</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">No agent data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Top 5 Agents by Completion Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} unit="%" />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
          <Bar dataKey="completion" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
