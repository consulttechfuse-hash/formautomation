'use client';

import { usePresence } from '@/app/hooks/usePresence';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  usePresence();
  return <>{children}</>;
}
