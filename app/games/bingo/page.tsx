'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Bingo is now embedded inside /games. Redirect there.
export default function BingoRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/games');
  }, [router]);
  return null;
}
