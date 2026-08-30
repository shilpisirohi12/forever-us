'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import PrivateZoneLock from './PrivateZoneLock';

export default function PageAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isPrivateUnlocked } = useApp();

  if (pathname === '/' || isPrivateUnlocked) return <>{children}</>;

  return <PrivateZoneLock />;
}
