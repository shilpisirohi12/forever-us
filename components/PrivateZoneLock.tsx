'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function PrivateZoneLock() {
  const { unlockPrivateZone } = useApp();
  const [pinInput, setPinInput] = useState('');

  const submitPin = () => {
    if (unlockPrivateZone(pinInput)) setPinInput('');
  };

  const pressKey = (key: string) => {
    if (key === 'C') {
      setPinInput('');
      return;
    }
    if (key === '✓') {
      submitPin();
      return;
    }
    if (pinInput.length >= 4) return;

    const nextPin = pinInput + key;
    setPinInput(nextPin);
    if (nextPin.length === 4 && unlockPrivateZone(nextPin)) setPinInput('');
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-b from-red-950/40 via-zinc-950 to-zinc-950 border border-red-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div>
        <h1 className="text-xl font-black text-white">Forever Us is locked</h1>
        <p className="text-xs text-zinc-400 mt-1">Enter your 4-digit PIN to access your shared couple space.</p>
      </div>

      <div className="flex justify-center gap-3 my-2" aria-label={`${pinInput.length} of 4 PIN digits entered`}>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pinInput.length > index ? 'bg-red-500 border-red-400 scale-110 shadow-lg shadow-red-500/50' : 'bg-zinc-900 border-zinc-700'}`} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
          <button key={key} type="button" onClick={() => pressKey(key)} className="py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/40 text-lg font-bold text-white transition active:scale-95 shadow-md">
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
