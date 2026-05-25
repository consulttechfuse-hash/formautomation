'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CompletionProgressChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clients } = await supabase
      .from('users')
      .select('onboarding_submitted')
      .eq('role', 'client')
      .eq('admin_id', user.id);

    const total = clients?.length || 0;
    const completed = clients?.filter(c => c.onboarding_submitted === true).length || 0;
    const notStarted = total - completed;

    setData([
      { name: 'Completed', value: completed },
      { name: 'Not Started', value: notStarted },
    ]);
    setLoading(false);
  };

  const COLORS = ['#10b981', '#f59e0b'];

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  if (data[0].value === 0 && data[1].value === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">Client Completion</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">No clients yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Client Completion Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
