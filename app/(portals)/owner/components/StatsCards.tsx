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
    // Get all clients from user_roles (NOT users table)
    const { data: clients } = await supabase
      .from('user_roles')
      .select('has_paid')
      .eq('role', 'client');

    const totalClients = clients?.length || 0;
    const paidClients = clients?.filter(c => c.has_paid === true).length || 0;
    
    // Revenue: R400 per paid client
    const revenue = paidClients * 400;
    const profit = paidClients * 200; // 50% of revenue

    // Get pending invites from user_roles where invitation_token exists and accepted_at is null
    const { data: pendingInvitesData } = await supabase
      .from('user_roles')
      .select('id')
      .not('invitation_token', 'is', null)
      .is('accepted_at', null);
    
    const pendingInvites = pendingInvitesData?.length || 0;

    // Get total admins from user_roles
    const { data: admins } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'admin');
    
    // Get total agents from user_roles
    const { data: agents } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'agent');

    // Anomalies should be 0 if data is consistent
    const anomalies = 0;

    setStats({
      revenue,
      profit,
      anomalies,
      pendingInvites,
      totalAdmins: admins?.length || 0,
      totalAgents: agents?.length || 0,
      totalClients,
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
