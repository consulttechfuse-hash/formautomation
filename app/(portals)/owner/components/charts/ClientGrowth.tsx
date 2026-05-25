'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  signups: number;
  cumulative: number;
}

export default function ClientGrowthChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: clients } = await supabase
      .from('users')
      .select('created_at')
      .eq('role', 'client');

    const monthlyMap = new Map<string, number>();
    
    // Initialize last 12 months
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
          signups,
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
      <h3 className="font-semibold text-lg mb-4">Client Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="cumulative" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Total Clients" />
          <Area type="monotone" dataKey="signups" stackId="2" stroke="#f59e0b" fill="#fcd34d" name="New Signups" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
