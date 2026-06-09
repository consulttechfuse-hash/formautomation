'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  revenue: number;
  clients: number;
}

export default function RevenueTrendChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get paid clients from user_roles
    const { data: paidClients } = await supabase
      .from('user_roles')
      .select('created_at, updated_at')
      .eq('role', 'client')
      .eq('has_paid', true);

    const monthlyMap = new Map<string, { revenue: number; clients: number }>();
    
    // Initialize last 12 months
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyMap.set(monthKey, { revenue: 0, clients: 0 });
    }

    (paidClients || []).forEach(client => {
      const paidDate = new Date(client.updated_at);
      const monthKey = `${paidDate.getFullYear()}-${(paidDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey);
      if (existing) {
        existing.revenue += 400;
        existing.clients += 1;
        monthlyMap.set(monthKey, existing);
      }
    });

    const chartData = Array.from(monthlyMap.entries())
      .map(([month, value]) => ({
        month: month.substring(5) + '/' + month.substring(2, 4),
        revenue: value.revenue,
        clients: value.clients,
      }))
      .reverse();

    setData(chartData);
    setLoading(false);
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Revenue Trend (Last 12 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (R)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#10b981" name="Paid Clients" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
