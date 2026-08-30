'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengesRedirectPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/games'); }, [router]);
  return null;
}
