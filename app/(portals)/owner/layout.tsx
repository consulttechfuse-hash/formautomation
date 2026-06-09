'use client';

import { usePresence } from '@/app/hooks/usePresence';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  usePresence();
  return <>{children}</>;
}
