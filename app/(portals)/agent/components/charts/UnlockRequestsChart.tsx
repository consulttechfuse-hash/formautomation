'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function UnlockRequestsChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: requests } = await supabase
      .from('unlock_requests')
      .select('status')
      .eq('requested_by', user.id);

    const total = requests?.length || 0;
    const pending = requests?.filter(r => r.status === 'pending').length || 0;
    const approved = requests?.filter(r => r.status === 'approved').length || 0;
    const declined = requests?.filter(r => r.status === 'declined').length || 0;

    setData([
      { name: 'Pending', value: pending },
      { name: 'Approved', value: approved },
      { name: 'Declined', value: declined },
    ]);
    setLoading(false);
  };

  const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

  if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

  if (data[0]?.value === 0 && data[1]?.value === 0 && data[2]?.value === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">My Unlock Requests</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">No unlock requests yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">My Unlock Requests</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
