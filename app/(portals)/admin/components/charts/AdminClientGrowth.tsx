'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminClientGrowthChart() {
  const [data, setData] = useState<{ month: string; cumulative: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadAdminAndData();
  }, []);

  const loadAdminAndData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setAdminId(user.id);
    await loadData(user.id);
  };

  const loadData = async (id: string) => {
    const { data: clients } = await supabase
      .from('users')
      .select('created_at')
      .eq('role', 'client')
      .eq('admin_id', id);

    const monthlyMap = new Map<string, number>();
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyMap.set(monthKey, 0);
    }

    (clients || []).forEach(client => {
      const date = new Date(client.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });

    let cumulative = 0;
    const chartData = Array.from(monthlyMap.entries())
      .map(([month, signups]) => {
        cumulative += signups;
        return {
          month: month.substring(5) + '/' + month.substring(2, 4),
          cumulative,
        };
      })
      .reverse();

    setData(chartData);
    setLoading(false);
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">My Client Growth</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="cumulative" stroke="#8b5cf6" fill="#c4b5fd" name="Total Clients" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
