'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AgentStat {
  id: string;
  email: string;
  totalClients: number;
  completedClients: number;
  completionRatio: number;
}

export default function AdminAgentPerformanceReport() {
  const [agents, setAgents] = useState<AgentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: agentsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent')
      .eq('admin_id', user.id);

    const stats: AgentStat[] = await Promise.all((agentsData || []).map(async (agent) => {
      const { data: clients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('agent_id', agent.id);

      const totalClients = clients?.length || 0;
      const completedClients = clients?.filter(c => c.onboarding_submitted === true).length || 0;
      const completionRatio = totalClients > 0 ? (completedClients / totalClients) * 100 : 0;

      return {
        id: agent.id,
        email: agent.email,
        totalClients,
        completedClients,
        completionRatio: Math.round(completionRatio),
      };
    }));

    setAgents(stats);
    setLoading(false);
  };

  if (loading) return <div className="p-8">Loading agent performance...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Agents Performance</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Agent Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Clients</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Completed</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Completion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{agent.email}</td>
                <td className="px-4 py-3 text-sm">{agent.totalClients}</td>
                <td className="px-4 py-3 text-sm">{agent.completedClients}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 rounded-full h-2" style={{ width: `${agent.completionRatio}%` }} />
                    </div>
                    <span className="text-sm">{agent.completionRatio}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
