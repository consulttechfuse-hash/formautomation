export const dynamic = 'force-dynamic';
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FormPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Form {slug}</h1>
      <p className="text-gray-600">This form is being prepared.</p>
    </div>
  );
}
