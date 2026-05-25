'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StatsCards() {
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    anomalies: 0,
    pendingInvites: 0,
    totalAdmins: 0,
    totalAgents: 0,
    totalClients: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Get all clients
    const { data: clients } = await supabase.from('users').select('*').eq('role', 'client');
    
    // Calculate revenue from paid clients only
    const paidClients = clients?.filter(c => c.has_paid === true) || [];
    const revenue = paidClients.length * 400;
    const profit = revenue * 0.5;

    // Get all admins and their assigned clients
    const { data: admins } = await supabase.from('users').select('*').eq('role', 'admin');
    let totalAdminRevenue = 0;
    for (const admin of (admins || [])) {
      const { data: adminClients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('admin_id', admin.id);
      const adminPaid = adminClients?.filter(c => c.has_paid === true).length || 0;
      totalAdminRevenue += adminPaid * 400;
    }

    const anomalies = Math.abs(totalAdminRevenue - revenue);

    // Get pending invites
    const { data: pendingUsers } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending');

    const { data: agents } = await supabase.from('users').select('*').eq('role', 'agent');
    const { data: clientsCount } = await supabase.from('users').select('*').eq('role', 'client');

    setStats({
      revenue,
      profit,
      anomalies,
      pendingInvites: pendingUsers?.length || 0,
      totalAdmins: admins?.length || 0,
      totalAgents: agents?.length || 0,
      totalClients: clientsCount?.length || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-90">Revenue</p>
          <p className="text-2xl font-bold">R{stats.revenue.toLocaleString()}</p>
          <p className="text-xs opacity-75">Based on paid clients (R400 each)</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-90">Profit (50%)</p>
          <p className="text-2xl font-bold">R{stats.profit.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-90">Anomalies</p>
          <p className="text-2xl font-bold">R{stats.anomalies.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-90">Pending Invites</p>
          <p className="text-2xl font-bold">{stats.pendingInvites}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Admins</p>
          <p className="text-2xl font-bold">{stats.totalAdmins}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Agents</p>
          <p className="text-2xl font-bold">{stats.totalAgents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">Total Clients</p>
          <p className="text-2xl font-bold">{stats.totalClients}</p>
        </div>
      </div>
    </div>
  );
}
