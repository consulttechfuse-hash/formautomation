'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AdminStats {
  totalClients: number;
  paidClients: number;
  pendingPayments: number;
  totalRevenue: number;
  conversionRate: number;
  activeAgents: number;
  commissionEarned: number;
  pendingUnlocks: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 0,
    paidClients: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    conversionRate: 0,
    activeAgents: 0,
    commissionEarned: 0,
    pendingUnlocks: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get admin ID from user_roles
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    const adminId = adminRole?.user_id || user.id;

    // Get all clients under this admin
    const { data: clients } = await supabase
      .from('user_roles')
      .select('user_id, email, has_paid, assigned_agent_id')
      .eq('role', 'client')
      .eq('assigned_admin_id', adminId);

    const totalClients = clients?.length || 0;
    const paidClients = clients?.filter(c => c.has_paid === true).length || 0;
    
    // Get pending payment requests for these clients
    const clientIds = clients?.map(c => c.user_id) || [];
    const { data: pendingPayments } = await supabase
      .from('manual_payment_requests')
      .select('*')
      .in('client_id', clientIds)
      .eq('status', 'pending');
    
    const pendingCount = pendingPayments?.length || 0;
    
    // Calculate revenue (R200 per paid client - admin commission)
    const commissionEarned = paidClients * 200;
    const totalRevenue = paidClients * 400;
    const conversionRate = totalClients > 0 ? (paidClients / totalClients) * 100 : 0;
    
    // Get active agents under this admin
    const { data: agents } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'agent')
      .eq('assigned_admin_id', adminId);
    
    const activeAgents = agents?.length || 0;
    
    // Get pending unlock requests for clients under this admin
    const { data: pendingUnlocks } = await supabase
      .from('unlock_requests')
      .select('*')
      .in('client_id', clientIds)
      .eq('status', 'pending');
    
    const pendingUnlocksCount = pendingUnlocks?.length || 0;

    setStats({
      totalClients,
      paidClients,
      pendingPayments: pendingCount,
      totalRevenue,
      conversionRate,
      activeAgents,
      commissionEarned,
      pendingUnlocks: pendingUnlocksCount
    });
    setLoading(false);
  };

  const statCards = [
    { title: 'Total Clients', value: stats.totalClients, color: 'from-blue-500 to-blue-600', icon: '👥', description: 'Total clients signed up' },
    { title: 'Paid Clients', value: stats.paidClients, color: 'from-green-500 to-green-600', icon: '✅', description: 'Clients who have paid' },
    { title: 'Pending Payments', value: stats.pendingPayments, color: 'from-yellow-500 to-yellow-600', icon: '⏳', description: 'Awaiting verification' },
    { title: 'Admin Commission', value: `R${stats.commissionEarned}`, color: 'from-emerald-500 to-emerald-600', icon: '💰', description: 'R200 per paid client' },
    { title: 'Total Revenue', value: `R${stats.totalRevenue}`, color: 'from-purple-500 to-purple-600', icon: '📊', description: 'Total client payments' },
    { title: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, color: 'from-orange-500 to-orange-600', icon: '📈', description: 'Paid / Total clients' },
    { title: 'Active Agents', value: stats.activeAgents, color: 'from-cyan-500 to-cyan-600', icon: '👤', description: 'Agents under you' },
    { title: 'Unlock Requests', value: stats.pendingUnlocks, color: 'from-red-500 to-red-600', icon: '🔓', description: 'Pending approvals' }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 hover:shadow-xl transition-shadow duration-300"
            style={{ borderLeftColor: card.color.split('-')[1] === 'blue' ? '#3b82f6' : card.color.split('-')[1] === 'green' ? '#22c55e' : card.color.split('-')[1] === 'yellow' ? '#eab308' : card.color.split('-')[1] === 'emerald' ? '#10b981' : card.color.split('-')[1] === 'purple' ? '#a855f7' : card.color.split('-')[1] === 'orange' ? '#f97316' : card.color.split('-')[1] === 'cyan' ? '#06b6d4' : '#ef4444' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <span className={`text-3xl font-bold`} style={{ color: card.color.split('-')[1] === 'blue' ? '#3b82f6' : card.color.split('-')[1] === 'green' ? '#22c55e' : card.color.split('-')[1] === 'yellow' ? '#eab308' : card.color.split('-')[1] === 'emerald' ? '#10b981' : card.color.split('-')[1] === 'purple' ? '#a855f7' : card.color.split('-')[1] === 'orange' ? '#f97316' : card.color.split('-')[1] === 'cyan' ? '#06b6d4' : '#ef4444' }}>
                  {card.value}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {card.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{card.description}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
        >
          🔄 Refresh Stats
        </button>
      </div>
    </div>
  );
}
