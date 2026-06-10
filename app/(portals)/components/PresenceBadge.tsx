'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatSAST } from '@/lib/timezone';

// ... rest of component

const getLastSeenText = (lastSeen: string | null) => {
  if (!lastSeen) return 'Never';
  
  // Parse the SAST timestamp
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  
  // Adjust for SAST
  const sastOffset = 2 * 60 * 60 * 1000;
  const lastSeenSAST = new Date(lastSeenDate.getTime());
  const nowSAST = new Date(now.getTime() + sastOffset);
  
  const diffSeconds = Math.floor((nowSAST.getTime() - lastSeenSAST.getTime()) / 1000);
  
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
};

// ... rest remains the same
