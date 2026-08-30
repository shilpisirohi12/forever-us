'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { Heart, Coins, Users, Lock, Unlock, Sparkles, Inbox } from 'lucide-react';
import PairingModal from './PairingModal';

export default function Header() {
  const { user, couple, isPrivateUnlocked, lockPrivateZone } = useApp();
  const [showPairModal, setShowPairModal] = useState(false);

  // Calculate days together
  const daysTogether = Math.max(
    1,
    Math.floor((Date.now() - new Date(couple.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  const currentPoints = couple.points[user.role] || 0;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/80 border-b border-rose-950/40 text-zinc-100 px-4 py-3 transition">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 shadow-md shadow-rose-900/30 group-hover:scale-105 transition">
              <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-base sm:text-lg bg-gradient-to-r from-rose-200 via-pink-100 to-amber-200 bg-clip-text text-transparent">
                Forever Us
              </span>
              <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                <span>10 years of us</span>
                <span>•</span>
                <span className="text-pink-300">❤️ {couple.partner1Name} & {couple.partner2Name}</span>
              </div>
            </div>
          </Link>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Love Coins Balance */}
            <Link
              href="/inbox"
              className="flex items-center justify-center rounded-full border border-pink-500/30 bg-pink-950/40 p-2 text-pink-300 transition hover:border-pink-400/60 hover:text-pink-100"
              title="Love Inbox"
              aria-label="Love Inbox"
            >
              <Inbox className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/rewards"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 text-xs font-bold transition shadow-sm"
              title="Your Love Coins"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{currentPoints}</span>
              <span className="hidden sm:inline text-[10px] text-amber-400/80 font-normal">Coins</span>
            </Link>

            {/* Active profile is assigned by the authenticated Supabase membership. */}
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-200" title="Profile set by your secure sign-in">
              <span>{user.avatar}</span>
              <span className="hidden md:inline">{user.name}</span>
            </div>

            {/* Private Zone Lock Status */}
            {isPrivateUnlocked ? (
              <button
                onClick={lockPrivateZone}
                className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/60 transition"
                title="Lock Private Zone"
              >
                <Unlock className="w-4 h-4 text-red-400" />
              </button>
            ) : (
              <Link
                href="/private-zone"
                className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition"
                title="Private Zone (PIN Protected)"
              >
                <Lock className="w-4 h-4" />
              </Link>
            )}

            {/* Couple Settings / Pairing Modal */}
            <button
              onClick={() => setShowPairModal(true)}
              className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
              title="Couple Space & Settings"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <PairingModal isOpen={showPairModal} onClose={() => setShowPairModal(false)} />
    </>
  );
}
