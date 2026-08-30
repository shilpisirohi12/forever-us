'use client';

import React from 'react';
import { Inbox, MessageCircleHeart, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Message } from '@/lib/types';

const ACTION_LABELS: Record<string, { emoji: string; label: string }> = {
  kiss: { emoji: '💋', label: 'Kiss' },
  hug: { emoji: '🫂', label: 'Hug' },
  nudge: { emoji: '💓', label: 'Nudge' },
  'love-note': { emoji: '✨', label: 'Love note' },
  'I need a kiss 😘': { emoji: '💋', label: 'Kiss' },
  'Hug required. Immediately.': { emoji: '🫂', label: 'Hug' },
  'Cuddle with me?': { emoji: '🤗', label: 'Cuddle' },
  'Massage please 🥺': { emoji: '💆', label: 'Massage request' },
  'Can you make me coffee? ❤️': { emoji: '☕', label: 'Coffee request' },
  'Can you handle dinner tonight?': { emoji: '🍽️', label: 'Dinner request' },
  'Can you spoil me a little today? 🥺': { emoji: '🥺', label: 'Spoil Me' },
  'I love you ❤️': { emoji: '❤️', label: 'Love you' },
  'Missing you right now.': { emoji: '😘', label: 'Miss you' },
  'Feeling flirty... thinking about you 🔥': { emoji: '🔥', label: 'Flirt' },
  'Come here… 👀': { emoji: '👀', label: 'Come here' },
  'Meet me on the couch.': { emoji: '🛋️', label: 'Cuddle time' },
  'Movie night?': { emoji: '🎬', label: 'Movie?' },
  'Want to go for a walk with me?': { emoji: '🚶', label: 'Walk?' },
  'Dessert/treat tonight?': { emoji: '🍦', label: 'Treat?' },
  'Can we have some phone-free time?': { emoji: '📵', label: 'Us time' },
};

function getActionDetails(message: Message) {
  return ACTION_LABELS[message.content] ?? ACTION_LABELS[message.type] ?? { emoji: '💌', label: 'Message' };
}

export default function InboxPage() {
  const { user, couple, messages } = useApp();
  const incomingMessages = messages
    .filter((message) => message.senderId !== user.id)
    .toSorted((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const partnerAvatar = user.role === 'partner1' ? couple.partner2Avatar : couple.partner1Avatar;
  const partnerName = user.role === 'partner1' ? couple.partner2Name : couple.partner1Name;

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in pb-12">
      <header className="rounded-3xl border border-pink-500/25 bg-gradient-to-br from-pink-950/40 to-zinc-900 p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/30 bg-pink-500/10 text-pink-300">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Love Inbox</h1>
            <p className="mt-0.5 text-xs text-zinc-400">Everything {partnerName} has sent you, in one calm place.</p>
          </div>
          <span className="ml-auto rounded-full border border-pink-500/25 bg-pink-500/10 px-2.5 py-1 text-xs font-bold text-pink-200">{incomingMessages.length}</span>
        </div>
      </header>

      {incomingMessages.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center">
          <MessageCircleHeart className="mx-auto h-8 w-8 text-zinc-600" />
          <h2 className="mt-3 text-sm font-bold text-white">Your inbox is waiting for some love</h2>
          <p className="mt-1 text-xs text-zinc-400">Switch to {partnerName}&apos;s profile and send a Quick Send action to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incomingMessages.map((message) => {
            const action = getActionDetails(message);
            const sentAt = new Date(message.timestamp);
            return (
              <article key={message.id} className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/75 p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-pink-500/20 bg-zinc-950 text-lg">{partnerAvatar}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span>{action.emoji}</span>
                      <h2 className="truncate text-sm font-bold text-white">{action.label}</h2>
                      <span className="text-[11px] text-zinc-500">from {message.senderName}</span>
                    </div>
                    <time dateTime={message.timestamp} className="shrink-0 text-[10px] font-medium text-pink-300">
                      {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">{message.content}</p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500"><Sparkles className="h-3 w-3" /> {sentAt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
