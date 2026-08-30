'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Heart, Sparkles, Flame, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    love: <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />,
    success: <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />,
    spicy: <Flame className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
  };

  const bgStyles = {
    love: 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50',
    success: 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/50',
    spicy: 'bg-red-950/90 border-red-500/40 text-red-100 shadow-red-950/50',
    info: 'bg-zinc-900/90 border-zinc-700 text-zinc-100 shadow-black/50',
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md pointer-events-none transition-all duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-xl text-sm font-medium ${bgStyles[toast.type]}`}
      >
        <div className="shrink-0">{icons[toast.type]}</div>
        <p className="flex-1 leading-snug">{toast.message}</p>
      </div>
    </div>
  );
}
