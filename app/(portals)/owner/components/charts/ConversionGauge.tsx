'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ConversionGauge() {
  const [conversionRate, setConversionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: clients } = await supabase
      .from('user_roles')
      .select('has_paid')
      .eq('role', 'client');

    const total = clients?.length || 0;
    const paid = clients?.filter(c => c.has_paid === true).length || 0;
    const rate = total > 0 ? (paid / total) * 100 : 0;

    setConversionRate(Math.round(rate));
    setLoading(false);
  };

  const getColor = () => {
    if (conversionRate >= 70) return 'text-green-600';
    if (conversionRate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <div className="h-40 flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Conversion Rate</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={conversionRate >= 70 ? '#10b981' : conversionRate >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeDasharray={`${conversionRate * 2.83} ${283 - conversionRate * 2.83}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1f2937">
              {conversionRate}%
            </text>
          </svg>
        </div>
        <p className={`text-sm mt-2 ${getColor()}`}>
          {conversionRate >= 70 ? 'Excellent' : conversionRate >= 40 ? 'Average' : 'Needs Improvement'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Paid clients / Total signups</p>
      </div>
    </div>
  );
}
