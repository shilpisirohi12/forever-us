'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { Home, Dices, HeartHandshake, Flame, Trophy } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { redemptions } = useApp();

  const pendingRedemptionsCount = redemptions.filter((r) => r.status === 'pending').length;

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      color: 'text-rose-400',
    },
    {
      label: 'Games',
      href: '/games',
      icon: Dices,
      color: 'text-violet-400',
      activeMatch: ['/games', '/games/bingo', '/games/challenges'],
    },
    {
      label: 'Date Night',
      href: '/date-night',
      icon: HeartHandshake,
      color: 'text-amber-400',
    },
    {
      label: 'Private',
      href: '/private-zone',
      icon: Flame,
      color: 'text-red-400',
    },
    {
      label: 'Rewards',
      href: '/rewards',
      icon: Trophy,
      color: 'text-yellow-400',
      badge: pendingRedemptionsCount > 0 ? pendingRedemptionsCount : null,
    },
  ];

  return (
    <nav className="w-full bg-zinc-950/90 border-b border-zinc-800/80 px-2 py-1.5 backdrop-blur-md">
      <div className="max-w-3xl mx-auto flex items-center justify-around gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.activeMatch
            ? item.activeMatch.includes(pathname)
            : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition duration-150 whitespace-nowrap text-xs font-semibold group ${
                isActive
                  ? 'bg-rose-500/20 text-white border border-rose-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 ${
                    isActive ? `${item.color} scale-110` : 'group-hover:scale-105'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 text-[8px] font-bold rounded-full bg-rose-600 text-white shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
