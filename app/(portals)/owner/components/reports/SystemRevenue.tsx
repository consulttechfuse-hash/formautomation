'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  profit: number;
  paidClients: number;
}

export default function SystemRevenueReport() {
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalPaidClients, setTotalPaidClients] = useState(0);
  const [anomalies, setAnomalies] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadSystemRevenue();
  }, []);

  const loadSystemRevenue = async () => {
    const { data: clients } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .eq('has_paid', true);

    const paidClients = clients || [];
    const totalPaid = paidClients.length;
    const revenue = totalPaid * 400;
    const profit = revenue * 0.5;

    setTotalRevenue(revenue);
    setTotalProfit(profit);
    setTotalPaidClients(totalPaid);

    // Calculate anomalies (expected vs actual revenue per admin)
    const { data: admins } = await supabase.from('users').select('*').eq('role', 'admin');
    let expectedRevenue = 0;
    for (const admin of (admins || [])) {
      const { data: adminClients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('admin_id', admin.id)
        .eq('has_paid', true);
      expectedRevenue += (adminClients?.length || 0) * 400;
    }
    setAnomalies(Math.abs(expectedRevenue - revenue));

    // Monthly data
    const monthlyMap = new Map<string, { revenue: number; paidClients: number }>();
    for (const client of paidClients) {
      const date = new Date(client.paid_at || client.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { revenue: 0, paidClients: 0 };
      monthlyMap.set(monthKey, {
        revenue: existing.revenue + 400,
        paidClients: existing.paidClients + 1,
      });
    }

    const monthly = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        profit: data.revenue * 0.5,
        paidClients: data.paidClients,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setMonthlyData(monthly);
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Month', 'Paid Clients', 'Revenue (R)', 'Profit (R)'];
    const rows = monthlyData.map(data => [
      data.month,
      data.paidClients,
      data.revenue,
      data.profit,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_revenue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8">Loading system revenue report...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Revenue Report</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Paid Clients</p>
          <p className="text-3xl font-bold">{totalPaidClients}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold">R{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Total Profit (50%)</p>
          <p className="text-3xl font-bold text-green-600">R{totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Anomalies</p>
          <p className="text-3xl font-bold">R{anomalies.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold">Monthly Revenue Trend</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Month</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Paid Clients</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue (R)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Profit (R)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyData.map((data) => (
                <tr key={data.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{data.month}</td>
                  <td className="px-4 py-3 text-sm">{data.paidClients}</td>
                  <td className="px-4 py-3 text-sm font-medium">R{data.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-600">R{data.profit.toLocaleString()}</td>
                </tr>
              ))}
              {monthlyData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No revenue data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
