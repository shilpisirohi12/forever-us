'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { X, Copy, Check, Heart, Users, Sparkles, Cloud } from 'lucide-react';

export default function PairingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { couple, updateCoupleInfo, isCloudConnected, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [p1Name, setP1Name] = useState(couple.partner1Name);
  const [p2Name, setP2Name] = useState(couple.partner2Name);
  const [p1Avatar, setP1Avatar] = useState(couple.partner1Avatar);
  const [p2Avatar, setP2Avatar] = useState(couple.partner2Avatar);
  const [anniversary, setAnniversary] = useState(couple.anniversaryDate);

  // The provider restores saved couple details after the modal first mounts.
  // Refresh the draft whenever the settings dialog opens so saving never overwrites them with defaults.
  useEffect(() => {
    if (!isOpen) return;
    setP1Name(couple.partner1Name);
    setP2Name(couple.partner2Name);
    setP1Avatar(couple.partner1Avatar);
    setP2Avatar(couple.partner2Avatar);
    setAnniversary(couple.anniversaryDate);
  }, [isOpen, couple]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couple.code);
    setCopied(true);
    showToast('Couple code copied to clipboard! 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    updateCoupleInfo({
      partner1Name: p1Name,
      partner2Name: p2Name,
      partner1Avatar: p1Avatar,
      partner2Avatar: p2Avatar,
      anniversaryDate: anniversary,
    });
    onClose();
  };

  const husbandEmojis = ['🤴', '👨', '👨‍🦱', '👨‍🦰', '🧔', '🕺', '🦸‍♂️', '🐻'];
  const wifeEmojis = ['👸', '👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '💃', '🦸‍♀️', '🐱'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900/95 border border-rose-500/20 rounded-3xl p-6 shadow-2xl text-zinc-100 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/30" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-rose-100">Couple Space & Pairing</h2>
              <p className="text-xs text-zinc-400">Manage your shared space and partner link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pairing Code Card */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-zinc-900 border border-rose-500/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold">Your Couple Code</span>
              <div className="text-2xl font-mono font-bold tracking-widest text-white mt-0.5">{couple.code}</div>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition shadow-lg shadow-rose-900/40"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Share Code'}
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Send this code to your partner to connect both devices in real-time.
          </p>
        </div>

        {/* Cloud Status */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-xs">
          <div className="flex items-center gap-2">
            <Cloud className={`w-4 h-4 ${isCloudConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>
              {isCloudConnected ? 'Supabase Realtime Cloud: Connected' : 'Local Storage Mode (Ready for Supabase)'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              isCloudConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {isCloudConnected ? 'Live Sync' : 'Offline Ready'}
          </span>
        </div>

        {/* Edit Profiles Form */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Husband */}
            <div className="p-3.5 bg-zinc-800/40 rounded-2xl border border-zinc-700/40 space-y-2.5">
              <label className="text-xs font-semibold text-rose-300">Husband</label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
              />
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Avatar</span>
                <div className="flex flex-wrap gap-1">
                  {husbandEmojis.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setP1Avatar(emo)}
                      className={`text-lg p-1 rounded-lg transition ${
                        p1Avatar === emo ? 'bg-rose-600 scale-110' : 'hover:bg-zinc-700'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Wife */}
            <div className="p-3.5 bg-zinc-800/40 rounded-2xl border border-zinc-700/40 space-y-2.5">
              <label className="text-xs font-semibold text-purple-300">Wife</label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Avatar</span>
                <div className="flex flex-wrap gap-1">
                  {wifeEmojis.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setP2Avatar(emo)}
                      className={`text-lg p-1 rounded-lg transition ${
                        p2Avatar === emo ? 'bg-purple-600 scale-110' : 'hover:bg-zinc-700'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Anniversary */}
          <div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Anniversary Date</label>
              <input
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-900/40 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
