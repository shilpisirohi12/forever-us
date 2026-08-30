'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Trophy,
  Coins,
  Sparkles,
  Gift,
  Plus,
  Check,
  X,
  Clock,
  Heart,
  Flame,
  Coffee,
  ShieldCheck,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { fireConfetti } from '@/components/Confetti';
import { Reward } from '@/lib/types';

export default function RewardsPage() {
  const {
    user,
    couple,
    rewards,
    redemptions,
    redeemReward,
    updateRedemptionStatus,
    addCustomReward,
    addPoints,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shop' | 'redemptions'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'intimacy' | 'service' | 'fun' | 'food'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New reward form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(50);
  const [newCategory, setNewCategory] = useState<'intimacy' | 'service' | 'fun' | 'food'>('service');

  const myCoins = couple.points[user.role] || 0;
  const partnerRole = user.role === 'partner1' ? 'partner2' : 'partner1';
  const partnerName = user.role === 'partner1' ? couple.partner2Name : couple.partner1Name;
  const partnerCoins = couple.points[partnerRole] || 0;

  const filteredRewards = rewards.filter(
    (r) => selectedCategory === 'all' || r.category === selectedCategory
  );

  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');
  const pastRedemptions = redemptions.filter((r) => r.status !== 'pending');

  const handleRedeem = (reward: Reward) => {
    if (redeemReward(reward)) {
      fireConfetti();
    }
  };

  const handleApproveClaim = (redemptionId: string) => {
    updateRedemptionStatus(redemptionId, 'claimed');
    fireConfetti();
    showToast('Reward marked as fulfilled! Enjoy your quality time! ❤️', 'love');
  };

  const handleRejectClaim = (redemptionId: string) => {
    updateRedemptionStatus(redemptionId, 'rejected');
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    addCustomReward({
      title: newTitle.trim(),
      description: newDesc.trim(),
      cost: newCost,
      category: newCategory,
      icon: 'Sparkles',
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const renderIcon = (category: string) => {
    switch (category) {
      case 'intimacy':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'food':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'fun':
        return <Film className="w-5 h-5 text-purple-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/60 border border-yellow-500/30 text-yellow-300 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Love Economy & Coupons</span>
        </div>
        <h1 className="text-2xl font-black text-white">Rewards Marketplace</h1>
        <p className="text-xs text-zinc-400">
          Redeem Love Coins for sweet favours, intimate privileges, and playful coupons!
        </p>
      </div>

      {/* Points Wallet Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* My Wallet */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400">Your Wallet</span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{user.avatar}</span>
              <span>{user.name}</span>
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-end gap-1">
              <Coins className="w-5 h-5 fill-amber-400" />
              <span>{myCoins}</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold">Love Coins</span>
          </div>
        </div>

        {/* Partner Wallet */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Partner Wallet</span>
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-1.5 mt-0.5">
              <span>{user.role === 'partner1' ? couple.partner2Avatar : couple.partner1Avatar}</span>
              <span>{partnerName}</span>
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-zinc-300 font-mono flex items-center justify-end gap-1">
              <Coins className="w-5 h-5 text-zinc-500" />
              <span>{partnerCoins}</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold">Love Coins</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'shop'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Coupon Shop ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('redemptions')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'redemptions'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Redemptions {pendingRedemptions.length > 0 ? `(${pendingRedemptions.length})` : ''}</span>
        </button>
      </div>

      {/* 1. COUPON SHOP TAB */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All Coupons' },
                { id: 'service', label: '✨ Acts of Service' },
                { id: 'food', label: '☕ Food & Drinks' },
                { id: 'intimacy', label: '🔥 Spicy & Intimate' },
                { id: 'fun', label: '🎬 Fun & Privileges' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>
          </div>

          {/* Coupons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRewards.map((reward) => {
              const canAfford = myCoins >= reward.cost;

              return (
                <div
                  key={reward.id}
                  className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all duration-200 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                        {renderIcon(reward.category)}
                      </div>
                      <span className="flex items-center gap-1 text-sm font-black text-amber-400 font-mono">
                        <Coins className="w-4 h-4 fill-amber-400" />
                        {reward.cost}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{reward.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{reward.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 capitalize">{reward.category} coupon</span>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-md ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-950/40'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Redeem</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. REDEMPTIONS TRACKER TAB */}
      {activeTab === 'redemptions' && (
        <div className="space-y-6">
          {/* Pending Redemptions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 px-1">
              Pending Coupon Claims ({pendingRedemptions.length})
            </h3>

            {pendingRedemptions.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                No pending claims right now!
              </div>
            ) : (
              pendingRedemptions.map((red) => {
                const isClaimedByMe = red.redeemedBy === user.id;

                return (
                  <div
                    key={red.id}
                    className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300">
                          Pending Approval
                        </span>
                        <h4 className="text-sm font-bold text-white">{red.rewardTitle}</h4>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Claimed by <span className="text-white font-semibold">{red.redeemedByName}</span> for {red.rewardCost} Love Coins
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isClaimedByMe ? (
                        <>
                          <button
                            onClick={() => handleRejectClaim(red.id)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 hover:text-red-300 text-zinc-400 text-xs transition"
                            title="Refund & Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveClaim(red.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>Honor & Fulfill</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-amber-300 font-medium italic">
                          Waiting for {partnerName} to honor...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Past Claims History */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
              Redemption History
            </h3>

            {pastRedemptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">No past redemptions yet.</div>
            ) : (
              pastRedemptions.map((red) => (
                <div
                  key={red.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-200">{red.rewardTitle}</span>
                    <p className="text-[10px] text-zinc-400">
                      Claimed by {red.redeemedByName} • {new Date(red.redeemedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      red.status === 'claimed'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-300 border border-red-500/20'
                    }`}
                  >
                    {red.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Custom Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateReward}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Create Custom Coupon</h3>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Foot Rub on Demand"
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What privileges does this coupon give?"
                rows={2}
                className="w-full p-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Cost (Coins)</label>
                <input
                  type="number"
                  min={10}
                  step={5}
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                >
                  <option value="service">Service</option>
                  <option value="food">Food</option>
                  <option value="intimacy">Intimate</option>
                  <option value="fun">Fun</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
              >
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
