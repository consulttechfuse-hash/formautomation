'use client';

import { usePresence } from '@/app/hooks/usePresence';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  usePresence();
  return <>{children}</>;
}
