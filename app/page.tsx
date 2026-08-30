'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import {
  Dices,
  HeartHandshake,
  Flame,
  Trophy,
  Heart,
  Sparkles,
  Calendar,
  Gift,
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { fireConfetti, fireHearts } from '@/components/Confetti';
import { DAILY_LOVE_PROMPTS, getDailyLovePromptIndex } from '@/lib/data/dailyLovePrompts';

const QUICK_SEND_GROUPS = [
  {
    title: 'Affection',
    accent: 'rose',
    actions: [
      { emoji: '💋', label: 'Kiss', message: 'I need a kiss 😘' },
      { emoji: '🫂', label: 'Hug', message: 'Hug required. Immediately.' },
      { emoji: '🤗', label: 'Cuddle', message: 'Cuddle with me?' },
      { emoji: '❤️', label: 'Love You', message: 'I love you ❤️' },
      { emoji: '😘', label: 'Miss You', message: 'Missing you right now.' },
    ],
  },
  {
    title: 'Take Care of Me',
    accent: 'amber',
    actions: [
      { emoji: '💆', label: 'Massage', message: 'Massage please 🥺' },
      { emoji: '☕', label: 'Coffee', message: 'Can you make me coffee? ❤️' },
      { emoji: '🍽️', label: 'Dinner', message: 'Can you handle dinner tonight?' },
      { emoji: '🥺', label: 'Spoil Me', message: 'Can you spoil me a little today? 🥺' },
      { emoji: '🍦', label: 'Treat?', message: 'Dessert/treat tonight?' },
    ],
  },
  {
    title: 'Together Time',
    accent: 'violet',
    actions: [
      { emoji: '👀', label: 'Come Here', message: 'Come here… 👀' },
      { emoji: '🛋️', label: 'Cuddle Time', message: 'Meet me on the couch.' },
      { emoji: '🎬', label: 'Movie?', message: 'Movie night?' },
      { emoji: '🚶', label: 'Walk?', message: 'Want to go for a walk with me?' },
      { emoji: '📵', label: 'Us Time', message: 'Can we have some phone-free time?' },
    ],
  },
  {
    title: 'Playful',
    accent: 'pink',
    actions: [
      { emoji: '🔥', label: 'Flirt', message: 'Feeling flirty... thinking about you 🔥' },
    ],
  },
] as const;

export default function HomePage() {
  const { user, couple, sendMessage, challenges, bingoCards, rewards, dateIdeas, showToast } = useApp();
  const [sentQuickAction, setSentQuickAction] = useState<string | null>(null);
  const [lovePromptIndex, setLovePromptIndex] = useState(() => getDailyLovePromptIndex());

  const daysTogether = Math.max(
    1,
    Math.floor((Date.now() - new Date(couple.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  const completedBingoCount = bingoCards.reduce(
    (sum, card) => sum + card.tiles.filter((t) => t.completedBy.length > 0).length,
    0
  );
  const activeChallengesCount = challenges.length;
  const partnerName = user.role === 'partner1' ? couple.partner2Name : couple.partner1Name;
  const partnerAvatar = user.role === 'partner1' ? couple.partner2Avatar : couple.partner1Avatar;
  const lovePrompt = DAILY_LOVE_PROMPTS[lovePromptIndex];

  const showAnotherLovePrompt = () => {
    const alternatives = DAILY_LOVE_PROMPTS
      .map((prompt, index) => ({ prompt, index }))
      .filter(({ prompt, index }) => index !== lovePromptIndex && prompt.category !== lovePrompt.category);
    setLovePromptIndex(alternatives[Math.floor(Math.random() * alternatives.length)].index);
  };

  const handleQuickSend = (label: string, message: string) => {
    sendMessage(message);
    if (label === 'Kiss' || label === 'Hug' || label === 'Love You') fireHearts();
    setSentQuickAction(label);
    showToast(`${label} sent to ${partnerName}`, 'love');
    setTimeout(() => setSentQuickAction(null), 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Hero Couple Banner */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-950/60 via-pink-950/30 to-zinc-900 border border-rose-500/30 shadow-2xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 text-3xl sm:text-4xl p-2 bg-zinc-900/60 rounded-2xl border border-rose-500/30 shadow-inner">
              <span>{couple.partner1Avatar}</span>
              <span className="scale-90">{couple.partner2Avatar}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {couple.partner1Name} & {couple.partner2Name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Together
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-200/80 mt-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline" />
                <span>10 years of loving each other</span>
              </p>
            </div>
          </div>

          <p className="max-w-[13rem] text-xs leading-relaxed text-rose-200/70 sm:text-right">Use Quick Send below for a little love, care, or quality time.</p>
        </div>

        {/* Quick Relationship Stats */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-rose-500/20 text-center">
          <div className="p-2.5 rounded-xl bg-zinc-900/40">
            <div className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">
              {couple.points.partner1 + couple.points.partner2}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Love Coins</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-900/40">
            <div className="text-lg sm:text-xl font-extrabold text-rose-400 font-mono">
              {completedBingoCount}/25
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Bingo Memories</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-900/40">
            <div className="text-lg sm:text-xl font-extrabold text-pink-400 font-mono">
              {dateIdeas.filter((d) => d.completed).length}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Dates Completed</div>
          </div>
        </div>
      </section>

      {/* Quick Send Actions */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400">Quick Send</h2>
            <p className="mt-1 text-xs text-zinc-500">Send a sweet request to {partnerName} in one tap.</p>
          </div>
          {sentQuickAction && <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300">{sentQuickAction} sent</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_SEND_GROUPS.map((group) => (
            <div key={group.title} className={`rounded-2xl border p-3 ${
              group.accent === 'amber' ? 'border-amber-500/25 bg-amber-950/10' :
              group.accent === 'violet' ? 'border-violet-500/25 bg-violet-950/10' :
              group.accent === 'pink' ? 'border-pink-500/25 bg-pink-950/10' :
              'border-rose-500/25 bg-rose-950/10'
            }`}>
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{group.title}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickSend(action.label, action.message)}
                    title={action.message}
                    className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/75 px-2.5 py-2 text-left text-xs font-semibold text-zinc-200 transition hover:border-rose-500/40 hover:bg-zinc-800 active:scale-[0.98]"
                  >
                    <span className="text-base leading-none">{action.emoji}</span>
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main 5 Core Feature Cards Grid */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 px-1">
          Explore Your Universe
        </h2>

        {/* Daily Love Prompt */}
        <section className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-950/50 via-zinc-900 to-purple-950/35 p-6 text-zinc-200 shadow-xl">
          <div className="pointer-events-none absolute -right-7 -top-8 text-9xl opacity-10">💌</div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Daily Love</span>
              <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[10px] capitalize text-rose-200">{lovePrompt.category}</span>
            </div>
            <button onClick={showAnotherLovePrompt} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300 transition hover:border-rose-400/50 hover:text-white" title="Show another prompt">
              <RefreshCw className="h-3.5 w-3.5" /> Another
            </button>
          </div>
          <p className="relative mt-5 max-w-2xl text-base font-semibold leading-relaxed text-white sm:text-lg">“{lovePrompt.prompt}”</p>
          <div className="relative mt-5 flex items-center gap-2 text-xs text-zinc-400"><Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />Take a moment to share your answer with {partnerName}.</div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Couple Games */}
          <Link
            href="/games"
            className="group relative overflow-hidden p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-violet-500/40 hover:bg-zinc-900/90 transition shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition">
                <Dices className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950/40 text-violet-300 border border-violet-500/20">
                3 Games
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition">
                Couple Games
              </h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Couple Bingo, Reveal Dice decks, and Spoil Me requests.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition">
              <span>Play Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 2. Date Night */}
          <Link
            href="/date-night"
            className="group relative overflow-hidden p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900/90 transition shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/20">
                Generator
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                Date Night
              </h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Random Date Night Roulette with mood/budget filters and shared bucket list.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition">
              <span>Find a Date</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 3. Private Zone */}
          <Link
            href="/private-zone"
            className="group relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-red-950/40 to-zinc-900 border border-red-500/20 hover:border-red-500/50 hover:bg-zinc-900/90 transition shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 group-hover:scale-110 transition">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30">
                XXX Spicy 🔥
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-white group-hover:text-red-300 transition">
                Private Zone
              </h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Flirty/Adult scratch cards, romance dice roller, and secret mutual desire matcher.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-red-400 group-hover:translate-x-1 transition">
              <span>Explore Private Zone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 4. Rewards & Coupons */}
          <Link
            href="/rewards"
            className="group relative overflow-hidden p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-yellow-500/40 hover:bg-zinc-900/90 transition shadow-lg flex flex-col justify-between sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  {couple.points[user.role]} Coins Available
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-white group-hover:text-yellow-300 transition">
                Love Rewards & Custom Coupons
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Earn coins by doing sweet gestures and challenges. Redeem romantic coupons like &quot;30-min Full Body Massage&quot; or &quot;Breakfast in Bed&quot;!
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-yellow-400 group-hover:translate-x-1 transition">
              <span>Browse Coupons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}
