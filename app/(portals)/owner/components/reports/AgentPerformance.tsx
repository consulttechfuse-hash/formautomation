'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ExportToPDF from '../../../components/ExportToPDF';

interface AgentStats {
  id: string;
  email: string;
  totalClients: number;
  completedClients: number;
  completionRatio: number;
  pendingUnlocks: number;
  approvedUnlocks: number;
  avgCompletionDays: number;
}

export default function AgentPerformanceReport() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAllAgents();
  }, []);

  const loadAllAgents = async () => {
    const { data: agentsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent');

    const stats = await Promise.all((agentsData || []).map(async (agent) => {
      const { data: clients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('agent_id', agent.id);

      const totalClients = clients?.length || 0;
      const completedClients = clients?.filter(c => c.onboarding_submitted === true).length || 0;
      const completionRatio = totalClients > 0 ? (completedClients / totalClients) * 100 : 0;

      const { data: unlockRequests } = await supabase
        .from('unlock_requests')
        .select('*')
        .eq('requested_by', agent.id);

      const pendingUnlocks = unlockRequests?.filter(r => r.status === 'pending').length || 0;
      const approvedUnlocks = unlockRequests?.filter(r => r.status === 'approved').length || 0;

      let avgCompletionDays = 0;
      if (completedClients > 0) {
        const completedClientsData = clients?.filter(c => c.onboarding_submitted === true);
        const totalDays = completedClientsData?.reduce((sum, client) => {
          const created = new Date(client.created_at);
          const submitted = new Date(client.submitted_at || client.created_at);
          const days = (submitted.getTime() - created.getTime()) / (1000 * 3600 * 24);
          return sum + days;
        }, 0) || 0;
        avgCompletionDays = totalDays / completedClients;
      }

      return {
        id: agent.id,
        email: agent.email,
        totalClients,
        completedClients,
        completionRatio: Math.round(completionRatio),
        pendingUnlocks,
        approvedUnlocks,
        avgCompletionDays: Math.round(avgCompletionDays),
      };
    }));

    setAgents(stats.sort((a, b) => b.completionRatio - a.completionRatio));
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Agent Email', 'Total Clients', 'Completed Clients', 'Completion %', 'Pending Unlocks', 'Approved Unlocks', 'Avg Completion (days)'];
    const rows = agents.map(agent => [
      agent.email,
      agent.totalClients,
      agent.completedClients,
      agent.completionRatio,
      agent.pendingUnlocks,
      agent.approvedUnlocks,
      agent.avgCompletionDays,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_performance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8">Loading agent performance report...</div>;
  }

  const totalAgents = agents.length;
  const totalClients = agents.reduce((sum, a) => sum + a.totalClients, 0);
  const avgCompletion = agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.completionRatio, 0) / agents.length) : 0;
  const totalPendingUnlocks = agents.reduce((sum, a) => sum + a.pendingUnlocks, 0);

  return (
    <div id="report-content" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Performance Report</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            type="button"
          >
            📥 Export to CSV
          </button>
          <ExportToPDF filename="agent_performance_report" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Agents</p>
          <p className="text-3xl font-bold">{totalAgents}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-3xl font-bold">{totalClients}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Avg Completion Rate</p>
          <p className="text-3xl font-bold">{avgCompletion}%</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Unlocks</p>
          <p className="text-3xl font-bold">{totalPendingUnlocks}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Agent Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Clients</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Completed</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Completion %</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pending Unlocks</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Approved</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Avg Days</th>
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
                        <div
                          className="bg-green-600 rounded-full h-2"
                          style={{ width: `${agent.completionRatio}%` }}
                        />
                      </div>
                      <span className="text-sm">{agent.completionRatio}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {agent.pendingUnlocks > 0 ? (
                      <span className="text-yellow-600 font-medium">{agent.pendingUnlocks}</span>
                    ) : (
                      agent.pendingUnlocks
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{agent.approvedUnlocks}</td>
                  <td className="px-4 py-3 text-sm">{agent.avgCompletionDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
