'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AdminRevenue {
  id: string;
  email: string;
  totalClients: number;
  paidClients: number;
  revenue: number;
  profit: number;
  paidToAdmin: number;
  abandonedPayments: number;
  conversionRate: number;
}

export default function AdminRevenueReport() {
  const [admins, setAdmins] = useState<AdminRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAdminRevenue();
  }, []);

  const loadAdminRevenue = async () => {
    const { data: adminsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');

    const stats = await Promise.all((adminsData || []).map(async (admin) => {
      const { data: clients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('admin_id', admin.id);

      const totalClients = clients?.length || 0;
      const paidClients = clients?.filter(c => c.has_paid === true).length || 0;
      const abandoned = clients?.filter(c => c.has_paid === false && c.payment_started === true).length || 0;
      const revenue = paidClients * 400;
      const profit = revenue * 0.5;
      const paidToAdmin = revenue * 0.5;
      const conversionRate = totalClients > 0 ? (paidClients / totalClients) * 100 : 0;

      return {
        id: admin.id,
        email: admin.email,
        totalClients,
        paidClients,
        revenue,
        profit,
        paidToAdmin,
        abandonedPayments: abandoned,
        conversionRate: Math.round(conversionRate),
      };
    }));

    setAdmins(stats.sort((a, b) => b.revenue - a.revenue));
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Admin Email', 'Total Clients', 'Paid Clients', 'Revenue (R)', 'Profit (R)', 'Paid to Admin (R)', 'Abandoned', 'Conversion %'];
    const rows = admins.map(admin => [
      admin.email,
      admin.totalClients,
      admin.paidClients,
      admin.revenue,
      admin.profit,
      admin.paidToAdmin,
      admin.abandonedPayments,
      admin.conversionRate,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_revenue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = admins.reduce((sum, a) => sum + a.revenue, 0);
  const totalProfit = admins.reduce((sum, a) => sum + a.profit, 0);
  const totalPaidToAdmin = admins.reduce((sum, a) => sum + a.paidToAdmin, 0);

  if (loading) {
    return <div className="p-8">Loading admin revenue report...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Revenue Report</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold">R{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Profit (50%)</p>
          <p className="text-3xl font-bold">R{totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Paid to Admins</p>
          <p className="text-3xl font-bold">R{totalPaidToAdmin.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Admin Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Clients</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Paid</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue (R)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Profit (R)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Paid to Admin</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{admin.email}</td>
                  <td className="px-4 py-3 text-sm">{admin.totalClients}</td>
                  <td className="px-4 py-3 text-sm">{admin.paidClients}</td>
                  <td className="px-4 py-3 text-sm font-medium">R{admin.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-600">R{admin.profit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">R{admin.paidToAdmin.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 rounded-full h-2" style={{ width: `${admin.conversionRate}%` }} />
                      </div>
                      <span className="text-sm">{admin.conversionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
