'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function RevenueByAdminChart() {
  const [data, setData] = useState<{ name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: admins } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin');

    const revenueData = await Promise.all((admins || []).map(async (admin) => {
      const { data: clients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('admin_id', admin.id)
        .eq('has_paid', true);

      const revenue = (clients?.length || 0) * 400;
      return {
        name: admin.email.split('@')[0],
        revenue,
      };
    }));

    setData(revenueData.filter(d => d.revenue > 0));
    setLoading(false);
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">Revenue by Admin</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">No revenue data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Revenue by Admin</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="revenue"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`R${value.toLocaleString()}`, 'Revenue']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
