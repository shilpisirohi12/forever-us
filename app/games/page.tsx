'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/lib/context/AppContext';
import {
  Grid3X3,
  Dices,
  Flame,
  Target,
  Sparkles,
  Trophy,
  Shuffle,
  Plus,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import { fireConfetti } from '@/components/Confetti';
import BingoBoard from '@/components/BingoBoard';
import { TruthOrDareCard, Challenge, BingoCard } from '@/lib/types';

// ─────────────── Theme helpers ───────────────
const THEME_STYLES: Record<string, { bg: string; border: string; badge: string; gradient: string }> = {
  romantic: {
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/40',
    badge: 'bg-rose-500/20 text-rose-200',
    gradient: 'from-rose-600 to-pink-600',
  },
  cozy: {
    bg: 'bg-indigo-950/30',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-500/20 text-indigo-200',
    gradient: 'from-indigo-600 to-blue-600',
  },
  funny: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-200',
    gradient: 'from-amber-500 to-orange-500',
  },
  spicy: {
    bg: 'bg-red-950/30',
    border: 'border-red-500/40',
    badge: 'bg-red-500/20 text-red-200',
    gradient: 'from-red-600 to-rose-700',
  },
  custom: {
    bg: 'bg-violet-950/30',
    border: 'border-violet-500/40',
    badge: 'bg-violet-500/20 text-violet-200',
    gradient: 'from-violet-600 to-purple-600',
  },
};

const EMPTY_25 = Array.from({ length: 25 }, () => '');

const QUEST_CREATOR_STYLES = {
  partner1: {
    card: 'bg-rose-950/25 border-rose-500/35 hover:border-rose-400/60',
    completedCard: 'bg-rose-950/15 border-emerald-500/35',
    label: 'bg-rose-500/15 text-rose-200 border-rose-400/25',
    button: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white',
    points: 'text-rose-300',
  },
  partner2: {
    card: 'bg-violet-950/25 border-violet-500/35 hover:border-violet-400/60',
    completedCard: 'bg-violet-950/15 border-emerald-500/35',
    label: 'bg-violet-500/15 text-violet-200 border-violet-400/25',
    button: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white',
    points: 'text-violet-300',
  },
};

export default function GamesPage() {
  const {
    user,
    couple,
    bingoCards,
    activeCardId,
    setActiveCardId,
    toggleBingoTile,
    resetBingoCard,
    deleteBingoCard,
    addCustomBingoCard,
    updateBingoCardName,
    updateBingoTile,
    shuffleBingoCard,
    reorderBingoTiles,
    truthOrDareCards,
    addCustomTruthOrDare,
    diceDecks,
    activeDiceDeckId,
    setActiveDiceDeckId,
    addDiceDeck,
    updateDiceDeck,
    challenges,
    acceptChallenge,
    completeChallenge,
    addCustomChallenge,
    updateChallenge,
    deleteChallenge,
    rewards,
    addPoints,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bingo' | 'truth-or-dare' | 'dice' | 'challenges'>('bingo');

  // ===================== BINGO STATE =====================
  const activeCard: BingoCard | undefined = bingoCards.find((c) => c.id === activeCardId) ?? bingoCards[0];
  const [bingoWonIds, setBingoWonIds] = useState<Set<string>>(new Set());

  // Win detection whenever the active card changes
  useEffect(() => {
    if (!activeCard) return;
    const myCompleted = activeCard.tiles.map((t) => t.completedBy.includes(user.id));
    let lines = 0;
    for (let r = 0; r < 5; r++) {
      if ([0, 1, 2, 3, 4].every((c) => myCompleted[r * 5 + c])) lines++;
    }
    for (let c = 0; c < 5; c++) {
      if ([0, 1, 2, 3, 4].every((r) => myCompleted[r * 5 + c])) lines++;
    }
    if ([0, 6, 12, 18, 24].every((i) => myCompleted[i])) lines++;
    if ([4, 8, 12, 16, 20].every((i) => myCompleted[i])) lines++;

    if (lines > 0 && !bingoWonIds.has(activeCard.id)) {
      setBingoWonIds((prev) => new Set([...prev, activeCard.id]));
      fireConfetti();
      showToast(`🎉 BINGO on "${activeCard.name}"! ${lines} line(s)!`, 'love');
    }
  }, [activeCard, user.id, bingoWonIds, showToast]);

  // Custom card creator state
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardEmoji, setNewCardEmoji] = useState('⭐');
  const [newCardTiles, setNewCardTiles] = useState<string[]>(EMPTY_25.slice());

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;
    const filled = newCardTiles.map((t, i) => t.trim() || `Square ${i + 1}`);
    // Ensure center is FREE SPACE
    filled[12] = filled[12] || 'FREE SPACE ⭐';
    addCustomBingoCard(newCardName.trim(), newCardEmoji, filled);
    setNewCardName('');
    setNewCardEmoji('⭐');
    setNewCardTiles(EMPTY_25.slice());
    setShowCreateCard(false);
  };

  // Retained state for previously saved cards; the Truth or Dare tab is no longer exposed.
  const [selectedTodCategory, setSelectedTodCategory] = useState<'all' | 'romantic' | 'deep' | 'spicy' | 'wild'>('all');
  const [activeTodIndex, setActiveTodIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedTodIds, setCompletedTodIds] = useState<string[]>([]);
  const [showTodModal, setShowTodModal] = useState(false);
  const [newTodType, setNewTodType] = useState<'truth' | 'dare'>('truth');
  const [newTodCategory, setNewTodCategory] = useState<'romantic' | 'deep' | 'spicy' | 'wild'>('spicy');
  const [newTodPrompt, setNewTodPrompt] = useState('');
  const [newTodPoints, setNewTodPoints] = useState(25);
  const filteredTodCards = truthOrDareCards.filter((card) => selectedTodCategory === 'all' || card.category === selectedTodCategory);
  const currentTodCard: TruthOrDareCard | undefined = filteredTodCards[activeTodIndex] || filteredTodCards[0];
  const handleNextTodCard = () => {
    setIsFlipped(false);
    setTimeout(() => setActiveTodIndex(Math.floor(Math.random() * filteredTodCards.length)), 150);
  };
  const handleCompleteTodCard = (card: TruthOrDareCard) => {
    if (completedTodIds.includes(card.id)) return;
    setCompletedTodIds((prev) => [...prev, card.id]);
    addPoints(user.role, card.points);
    fireConfetti();
    showToast(`Earned +${card.points} Love Coins!`, 'love');
  };
  const handleAddTodCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodPrompt.trim()) return;
    addCustomTruthOrDare({ type: newTodType, category: newTodCategory, prompt: newTodPrompt.trim(), points: newTodPoints });
    setNewTodPrompt('');
    setShowTodModal(false);
  };

  // ===================== REVEAL DICE STATE =====================
  const activeDiceDeck = diceDecks.find((deck) => deck.id === activeDiceDeckId) ?? diceDecks[0];
  const [rolledFace, setRolledFace] = useState<number | null>(null);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [showDiceEditor, setShowDiceEditor] = useState(false);
  const [isCreatingDiceDeck, setIsCreatingDiceDeck] = useState(false);
  const [diceDeckNameDraft, setDiceDeckNameDraft] = useState('');
  const [diceDeckEmojiDraft, setDiceDeckEmojiDraft] = useState('🎲');
  const [diceItemDrafts, setDiceItemDrafts] = useState<string[]>(Array.from({ length: 6 }, () => ''));

  const openDiceEditor = (createNew = false) => {
    setIsCreatingDiceDeck(createNew);
    setDiceDeckNameDraft(createNew ? '' : activeDiceDeck?.name ?? '');
    setDiceDeckEmojiDraft(createNew ? '🎲' : activeDiceDeck?.emoji ?? '🎲');
    setDiceItemDrafts(createNew ? Array.from({ length: 6 }, () => '') : Array.from({ length: 6 }, (_, index) => activeDiceDeck?.items[index] || `Prompt ${index + 1}`));
    setShowDiceEditor(true);
  };

  const saveDiceDeck = (e: React.FormEvent) => {
    e.preventDefault();
    const name = diceDeckNameDraft.trim();
    const items = diceItemDrafts.map((item, index) => item.trim() || `Prompt ${index + 1}`);
    if (!name) return;
    if (isCreatingDiceDeck) addDiceDeck(name, diceDeckEmojiDraft || '🎲', items);
    else if (activeDiceDeck) updateDiceDeck(activeDiceDeck.id, { name, emoji: diceDeckEmojiDraft || '🎲', items });
    setShowDiceEditor(false);
  };

  const rollDice = () => {
    if (!activeDiceDeck || isRollingDice) return;
    setIsRollingDice(true);
    setRolledFace(null);
    setTimeout(() => {
      setRolledFace(Math.floor(Math.random() * 6) + 1);
      setIsRollingDice(false);
    }, 650);
  };

  // ===================== CHALLENGES STATE =====================
  const [completingChallengeId, setCompletingChallengeId] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [triggerReward, setTriggerReward] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [newChallengePoints, setNewChallengePoints] = useState(30);
  const [newChallengeRewardId, setNewChallengeRewardId] = useState('');
  const partnerRole = user.role === 'partner1' ? 'partner2' : 'partner1';
  const [newChallengeAssignedTo, setNewChallengeAssignedTo] = useState<'partner1' | 'partner2'>(partnerRole);
  const [questFormErrors, setQuestFormErrors] = useState({ heading: false, description: false });
  const [spoilMeTab, setSpoilMeTab] = useState<'pending' | 'completed'>('pending');
  const pendingRequests = challenges.filter((challenge) => challenge.completedBy.length === 0);
  const completedRequests = challenges.filter((challenge) => challenge.completedBy.length > 0);

  const handleCompleteChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingChallengeId) return;
    completeChallenge(completingChallengeId, proofNote.trim() || undefined, triggerReward);
    fireConfetti();
    setCompletingChallengeId(null);
  };

  const handleAddChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = {
      heading: !newChallengeTitle.trim(),
      description: !newChallengeDesc.trim(),
    };
    setQuestFormErrors(errors);
    if (errors.heading || errors.description) return;
    if (editingChallengeId) {
      updateChallenge(editingChallengeId, {
        title: newChallengeTitle.trim(),
        description: newChallengeDesc.trim(),
        assignedTo: newChallengeAssignedTo,
        rewardId: newChallengeRewardId || undefined,
      });
    } else {
      addCustomChallenge({
        title: newChallengeTitle.trim(),
        description: newChallengeDesc.trim(),
        assignedTo: newChallengeAssignedTo,
        points: newChallengePoints,
        rewardId: newChallengeRewardId || undefined,
      });
    }
    setNewChallengeTitle('');
    setNewChallengeDesc('');
    setNewChallengeAssignedTo(partnerRole);
    setNewChallengeRewardId('');
    setQuestFormErrors({ heading: false, description: false });
    setEditingChallengeId(null);
    setShowChallengeModal(false);
  };

  const openChallengeEditor = (challenge: Challenge) => {
    const creatorRole = challenge.createdBy ?? 'partner1';
    setEditingChallengeId(challenge.id);
    setNewChallengeTitle(challenge.title);
    setNewChallengeDesc(challenge.description);
    setNewChallengeAssignedTo(challenge.assignedTo ?? (creatorRole === 'partner1' ? 'partner2' : 'partner1'));
    setNewChallengeRewardId(challenge.rewardId ?? '');
    setQuestFormErrors({ heading: false, description: false });
    setShowChallengeModal(true);
  };

  const openNewChallenge = () => {
    setEditingChallengeId(null);
    setNewChallengeTitle('');
    setNewChallengeDesc('');
    setNewChallengeAssignedTo(partnerRole);
    setNewChallengeRewardId('');
    setQuestFormErrors({ heading: false, description: false });
    setShowChallengeModal(true);
  };

  const partnerName = user.role === 'partner1' ? couple.partner2Name : couple.partner1Name;
  const partnerAvatar = user.role === 'partner1' ? couple.partner2Avatar : couple.partner1Avatar;
  const formCreatorRole = challenges.find((challenge) => challenge.id === editingChallengeId)?.createdBy ?? user.role;
  const completingReward = rewards.find((reward) => reward.id === challenges.find((challenge) => challenge.id === completingChallengeId)?.rewardId);
  const personForRole = (role: 'partner1' | 'partner2') => ({
    name: role === 'partner1' ? couple.partner1Name : couple.partner2Name,
    avatar: role === 'partner1' ? couple.partner1Avatar : couple.partner2Avatar,
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Play & Earn Love Coins</span>
        </div>
        <h1 className="text-2xl font-black text-white">Couple Game Arena</h1>
        <p className="text-xs text-zinc-400">
          Play with <span className="text-rose-300 font-semibold">{partnerName}</span> — mark moments, flip cards, complete quests!
        </p>
      </div>

      {/* Game Tab Switcher */}
      <div className="flex items-center bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
        <button
          onClick={() => setActiveTab('bingo')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'bingo' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Grid3X3 className="w-4 h-4" /><span>Couple Bingo</span>
        </button>
        <button
          onClick={() => setActiveTab('dice')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'dice' ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Dices className="w-4 h-4" /><span>Reveal Dice</span>
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'challenges' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" /><span>Spoil Me</span>
        </button>
      </div>

      {/* ======================= TAB 1: COUPLE BINGO ======================= */}
      {activeTab === 'bingo' && !showCreateCard && (
        <div className="space-y-4 animate-fade-in">

          {/* Card picker row */}
          <div className="flex flex-wrap items-center gap-2">
            {bingoCards.map((card) => {
              const style = THEME_STYLES[card.theme] ?? THEME_STYLES.custom;
              const isActive = card.id === (activeCard?.id);
              return (
                <button
                  key={card.id}
                  onClick={() => setActiveCardId(card.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${style.gradient} text-white border-transparent shadow-md`
                      : `${style.bg} ${style.border} text-zinc-300 hover:text-white`
                  }`}
                >
                  <span className="text-base leading-none">{card.emoji}</span>
                  <span>{card.name}</span>
                </button>
              );
            })}

            {/* Create new card button */}
            <button
              onClick={() => setShowCreateCard(true)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 text-xs font-semibold transition whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Card</span>
            </button>
          </div>

          {activeCard && (
            <BingoBoard
              card={activeCard}
              userId={user.id}
              partnerAvatar={partnerAvatar}
              onToggleTile={(tileId) => toggleBingoTile(activeCard.id, tileId)}
              onReset={() => resetBingoCard(activeCard.id)}
              onDelete={() => { if (window.confirm(`Delete the entire “${activeCard.name}” bingo card? This cannot be undone.`)) deleteBingoCard(activeCard.id); }}
              onUpdateName={(name) => updateBingoCardName(activeCard.id, name)}
              onShuffle={() => shuffleBingoCard(activeCard.id)}
              onUpdateTile={(tileId, text) => updateBingoTile(activeCard.id, tileId, text)}
              onReorderTiles={(fromIndex, toIndex) => reorderBingoTiles(activeCard.id, fromIndex, toIndex)}
            />
          )}

          <p className="text-center text-[11px] text-zinc-500">
            Tap a square to stamp it. Drag squares to swap them, or tap the pencil to edit text. Get 5 in a row for 🎉 BINGO!
          </p>
        </div>
      )}

      {/* ======================= CREATE CUSTOM BINGO CARD ======================= */}
      {activeTab === 'bingo' && showCreateCard && (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setShowCreateCard(false)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to cards
          </button>

          <form onSubmit={handleCreateCard} className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Create Your Bingo Card</h3>

              <div className="flex gap-2">
                <div className="w-16">
                  <label className="text-[11px] text-zinc-400 block mb-1">Emoji</label>
                  <input
                    type="text"
                    value={newCardEmoji}
                    onChange={(e) => setNewCardEmoji(e.target.value)}
                    maxLength={2}
                    className="w-full text-center text-xl bg-zinc-950 border border-zinc-700 rounded-xl p-2 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-400 block mb-1">Card Name</label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="e.g. Our First Year"
                    className="w-full px-3 py-2.5 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Fill in Your 25 Squares</h3>
                <span className="text-[11px] text-zinc-500">Center (#13) = FREE SPACE by default</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {newCardTiles.map((text, i) => (
                  <div key={i} className="relative">
                    <input
                      value={i === 12 ? (text || 'FREE SPACE ⭐') : text}
                      onChange={(e) => {
                        const updated = [...newCardTiles];
                        updated[i] = e.target.value;
                        setNewCardTiles(updated);
                      }}
                      placeholder={i === 12 ? 'FREE SPACE' : `#${i + 1}`}
                      disabled={i === 12}
                      className={`w-full aspect-square text-[9px] text-center rounded-lg border p-1 resize-none focus:outline-none overflow-hidden ${
                        i === 12
                          ? 'bg-violet-950/60 border-violet-500/50 text-violet-200 cursor-default'
                          : 'bg-zinc-950 border-zinc-700 text-white focus:border-violet-500'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-zinc-500 mt-1">
                Leave squares blank and they'll auto-fill with placeholder text.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateCard(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl shadow-md transition active:scale-95"
              >
                Create Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= TAB 2: TRUTH OR DARE ======================= */}
      {activeTab === 'truth-or-dare' && (
        <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All', icon: '✨' },
                { id: 'romantic', label: 'Romantic', icon: '💕' },
                { id: 'deep', label: 'Deep', icon: '💭' },
                { id: 'spicy', label: 'Spicy', icon: '🔥' },
                { id: 'wild', label: 'Wild', icon: '🦁' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedTodCategory(cat.id as any); setActiveTodIndex(0); setIsFlipped(false); }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedTodCategory === cat.id ? 'bg-violet-600 text-white shadow-md' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span><span>{cat.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTodModal(true)}
              className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5" /><span>Add Card</span>
            </button>
          </div>

          {currentTodCard ? (
            <div className="flex flex-col items-center space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-80 cursor-pointer [perspective:1000px] select-none group"
              >
                <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl shadow-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 [backface-visibility:hidden] p-6 rounded-3xl bg-gradient-to-br from-violet-950 via-purple-950 to-zinc-900 border-2 border-violet-500/40 flex flex-col justify-between items-center text-center shadow-xl">
                    <div className="flex items-center justify-between w-full">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">{currentTodCard.category}</span>
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> +{currentTodCard.points} pts</span>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                        {currentTodCard.type === 'truth' ? '💭' : '⚡'}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-wider text-white">{currentTodCard.type}</h3>
                      <p className="text-xs text-violet-300/80">Tap anywhere to flip & reveal</p>
                    </div>
                    <div className="text-[10px] text-zinc-500">Forever Us • {couple.partner1Name} & {couple.partner2Name}</div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-purple-950/60 to-zinc-950 border-2 border-purple-400/50 flex flex-col justify-between text-center shadow-2xl">
                    <div className="flex items-center justify-between w-full">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${currentTodCard.type === 'truth' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                        {currentTodCard.type} • {currentTodCard.category}
                      </span>
                      <span className="text-xs font-bold text-amber-400">+{currentTodCard.points} Coins</span>
                    </div>
                    <div className="my-auto px-2">
                      <p className="text-base sm:text-lg font-bold text-white leading-relaxed">&quot;{currentTodCard.prompt}&quot;</p>
                    </div>
                    <div className="text-[11px] text-zinc-400">Tap to flip back</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleNextTodCard}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition active:scale-95 shadow-md"
                >
                  <Shuffle className="w-4 h-4 text-violet-400" /><span>Draw Another</span>
                </button>
                <button
                  onClick={() => handleCompleteTodCard(currentTodCard)}
                  disabled={completedTodIds.includes(currentTodCard.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition active:scale-95 shadow-lg ${
                    completedTodIds.includes(currentTodCard.id)
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
                  }`}
                >
                  {completedTodIds.includes(currentTodCard.id) ? (
                    <><CheckCircle2 className="w-4 h-4" /><span>Completed!</span></>
                  ) : (
                    <><Sparkles className="w-4 h-4" /><span>Claim +{currentTodCard.points} Pts</span></>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 bg-zinc-900/50 rounded-2xl">No cards in this category.</div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: REVEAL DICE ======================= */}
      {activeTab === 'dice' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            {diceDecks.map((deck) => (
              <button key={deck.id} onClick={() => { setActiveDiceDeckId(deck.id); setRolledFace(null); }} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${deck.id === activeDiceDeck?.id ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-md' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white'}`}>
                <span className="text-base">{deck.emoji}</span><span>{deck.name}</span>
              </button>
            ))}
            <button onClick={() => openDiceEditor(true)} className="flex items-center gap-1 rounded-xl border border-dashed border-zinc-600 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-cyan-400 hover:text-white">
              <Plus className="h-3.5 w-3.5" /> New deck
            </button>
          </div>

          {activeDiceDeck ? (
            <div className="overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/35 via-zinc-900 to-zinc-900 p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Six hidden prompts</p>
                  <h2 className="mt-1 text-lg font-black text-white">{activeDiceDeck.emoji} {activeDiceDeck.name}</h2>
                  <p className="mt-1 text-xs text-zinc-400">Roll the die to reveal exactly one prompt.</p>
                </div>
                <button onClick={() => openDiceEditor()} className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:text-white">
                  <Pencil className="h-3.5 w-3.5" /> Edit deck
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activeDiceDeck.items.slice(0, 6).map((_, index) => {
                  const face = index + 1;
                  const isRevealed = rolledFace === face;
                  return (
                    <div key={face} className={`min-h-24 rounded-2xl border p-3 transition ${isRevealed ? 'border-cyan-300/60 bg-cyan-500/15 shadow-lg shadow-cyan-950/30' : 'border-zinc-700/70 bg-zinc-950/55'}`}>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${isRevealed ? 'bg-cyan-400 text-zinc-950' : 'bg-zinc-800 text-zinc-500'}`}>{face}</span>
                      {isRevealed ? <p className="mt-2 text-xs font-semibold leading-relaxed text-cyan-50">{activeDiceDeck.items[index]}</p> : <p className="mt-3 text-center text-xs text-zinc-600">Hidden</p>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col items-center gap-3">
                <button onClick={rollDice} disabled={isRollingDice} className={`flex h-20 w-20 items-center justify-center rounded-3xl border text-4xl shadow-xl transition active:scale-95 ${isRollingDice ? 'animate-bounce border-cyan-300 bg-cyan-400/30' : 'border-cyan-400/50 bg-cyan-500/15 hover:bg-cyan-500/25'}`} aria-label="Roll the dice">
                  🎲
                </button>
                <button onClick={rollDice} disabled={isRollingDice} className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-xs font-black text-zinc-950 shadow-md transition hover:from-sky-400 hover:to-cyan-400 disabled:opacity-60">
                  {isRollingDice ? 'Rolling…' : rolledFace ? `Roll again · last: ${rolledFace}` : 'Roll the dice'}
                </button>
              </div>
            </div>
          ) : <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-xs text-zinc-400">Create a six-prompt deck to start rolling.</div>}
        </div>
      )}

      {/* ======================= TAB 4: SPOIL ME ======================= */}
      {activeTab === 'challenges' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
              <button onClick={() => setSpoilMeTab('pending')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${spoilMeTab === 'pending' ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}>
                Pending ({pendingRequests.length})
              </button>
              <button onClick={() => setSpoilMeTab('completed')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${spoilMeTab === 'completed' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}>
                Completed ({completedRequests.length})
              </button>
            </div>
            <button
              onClick={openNewChallenge}
              className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5" /><span>New Request</span>
            </button>
          </div>

          <div className="space-y-3">
            {(spoilMeTab === 'pending' ? pendingRequests : completedRequests).map((challenge) => {
              const isCompletedByMe = challenge.completedBy.some((c) => c.userId === user.id);
              const completion = challenge.completedBy[0];
              // Older locally saved quests did not have creator data; keep them readable.
              const creatorRole = challenge.createdBy ?? 'partner1';
              const recipientRole = challenge.assignedTo ?? (creatorRole === 'partner1' ? 'partner2' : 'partner1');
              const creator = personForRole(creatorRole);
              const recipient = personForRole(recipientRole);
              const creatorStyle = QUEST_CREATOR_STYLES[creatorRole];
              const reward = rewards.find((item) => item.id === challenge.rewardId);
              const isForMe = recipientRole === user.role;
              const isComplete = challenge.completedBy.length > 0;
              const completedBy = completion ? personForRole(completion.userId === 'partner2' ? 'partner2' : 'partner1') : null;
              return (
                <div
                  key={challenge.id}
                  className={`p-5 rounded-3xl border transition-all duration-200 shadow-md ${
                    isCompletedByMe ? creatorStyle.completedCard : creatorStyle.card
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="pt-2">
                        <h3 className="text-sm font-bold text-white">{challenge.title}</h3>
                      </div>
                    </div>
                    <span className={`text-xs font-black flex items-center gap-1 shrink-0 ${creatorStyle.points}`}>
                      <Trophy className="w-3.5 h-3.5" /> +{challenge.points}
                    </span>
                  </div>

                  <div className="pt-3">
                    <p className="text-xs text-zinc-300 leading-relaxed">{challenge.description}</p>
                  </div>

                  <div className={`mt-4 flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs ${creatorStyle.label}`}>
                    <span className="text-base leading-none">{creator.avatar}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider opacity-70">From</p>
                      <p className="font-bold truncate">{creator.name}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 opacity-70" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider opacity-70">For</p>
                      <p className="font-bold truncate">{recipient.name}</p>
                    </div>
                    <span className="text-base leading-none ml-auto">{recipient.avatar}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                    <span className={`rounded-full px-2.5 py-1 ${isComplete ? 'bg-emerald-500/15 text-emerald-300' : challenge.acceptedBy ? 'bg-sky-500/15 text-sky-300' : 'bg-zinc-800 text-zinc-300'}`}>
                      {isComplete ? 'Completed' : challenge.acceptedBy ? 'Accepted' : 'Awaiting acceptance'}
                    </span>
                    {reward && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-300">{challenge.rewardTriggered ? 'Reward triggered' : `Reward: ${reward.title}`}</span>}
                  </div>

                  {completion && completedBy && (
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
                      <span>{completedBy.avatar}</span>
                      <div>
                        <span className="font-semibold text-emerald-300">Completed on {completion.completedAt.slice(0, 10)} by {completedBy.name}</span>
                        {completion.note && <p className="text-zinc-400 text-[11px] italic mt-0.5">&quot;{completion.note}&quot;</p>}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end pt-3 border-t border-zinc-800/80">
                    <div className="mr-auto flex items-center gap-1">
                      {!isComplete && <button onClick={() => openChallengeEditor(challenge)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-white transition" aria-label={`Edit ${challenge.title}`}>
                        <Pencil className="w-3.5 h-3.5" /><span>Edit</span>
                      </button>}
                      <button onClick={() => { if (window.confirm(`Delete “${challenge.title}”? This cannot be undone.`)) deleteChallenge(challenge.id); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-red-500/10 hover:text-red-300 transition" aria-label={`Delete ${challenge.title}`}>
                        <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                      </button>
                    </div>
                    {isComplete ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /><span>{isCompletedByMe ? 'You earned the points' : 'Request completed'}</span>
                      </div>
                    ) : !challenge.acceptedBy && isForMe ? (
                      <button onClick={() => acceptChallenge(challenge.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition active:scale-95 ${creatorStyle.button}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /><span>Accept Request</span>
                      </button>
                    ) : challenge.acceptedBy && isForMe ? (
                      <button
                        onClick={() => { setCompletingChallengeId(challenge.id); setProofNote(''); setTriggerReward(Boolean(reward)); }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition active:scale-95 ${creatorStyle.button}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /><span>Complete &amp; Earn</span>
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">{challenge.acceptedBy ? `${recipient.name} is working on it` : `Waiting for ${recipient.name}`}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {(spoilMeTab === 'pending' ? pendingRequests : completedRequests).length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-10 text-center text-xs text-zinc-400">
                {spoilMeTab === 'pending' ? 'No pending requests right now.' : 'No completed requests yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODALS ======================= */}

      {/* Add Truth or Dare Modal */}
      {showTodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleAddTodCard} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Create Custom Card</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['truth', 'dare'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setNewTodType(t)}
                  className={`py-2 rounded-xl text-xs uppercase font-bold transition ${newTodType === t ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{t}</button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(['romantic', 'deep', 'spicy', 'wild'] as const).map((c) => (
                <button key={c} type="button" onClick={() => setNewTodCategory(c)}
                  className={`py-1.5 rounded-lg text-[10px] uppercase font-bold transition ${newTodCategory === c ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{c}</button>
              ))}
            </div>
            <textarea value={newTodPrompt} onChange={(e) => setNewTodPrompt(e.target.value)}
              placeholder="Enter your prompt..." rows={3}
              className="w-full p-3 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-violet-500" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowTodModal(false)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl">Save Card</button>
            </div>
          </form>
        </div>
      )}

      {/* Complete Challenge Modal */}
      {completingChallengeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleCompleteChallengeSubmit} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Request complete! 🎉</h3>
            <p className="text-xs text-zinc-400">Leave a sweet note for {partnerName}:</p>
            <textarea value={proofNote} onChange={(e) => setProofNote(e.target.value)}
              placeholder="e.g. Left a surprise note in your bag! ❤️" rows={3}
              className="w-full p-3 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500" />
            {completingReward && (
              <label className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
                <input type="checkbox" checked={triggerReward} onChange={(e) => setTriggerReward(e.target.checked)} className="mt-0.5 accent-amber-500" />
                <span><strong>Trigger reward:</strong> {completingReward.title}</span>
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCompletingChallengeId(null)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl">Earn points</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Challenge Modal */}
      {showChallengeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleAddChallengeSubmit} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">{editingChallengeId ? 'Edit Spoil Me Request' : 'Create Spoil Me Request'}</h3>
            <div>
              <label htmlFor="quest-heading" className="block mb-1.5 text-[11px] font-semibold text-zinc-300">Heading</label>
              <input id="quest-heading" type="text" value={newChallengeTitle} onChange={(e) => { setNewChallengeTitle(e.target.value); setQuestFormErrors((errors) => ({ ...errors, heading: false })); }} placeholder="Give your quest a name" aria-invalid={questFormErrors.heading}
              className={`w-full px-3 py-2 text-xs bg-zinc-950 border rounded-xl text-white focus:outline-none focus:border-amber-500 ${questFormErrors.heading ? 'border-red-500 ring-1 ring-red-500/50' : 'border-zinc-700'}`} />
              {questFormErrors.heading && <p className="mt-1.5 text-[11px] text-red-400">A heading is required.</p>}
            </div>
            <div>
              <label htmlFor="quest-description" className="block mb-1.5 text-[11px] font-semibold text-zinc-300">Description</label>
              <textarea id="quest-description" value={newChallengeDesc} onChange={(e) => { setNewChallengeDesc(e.target.value); setQuestFormErrors((errors) => ({ ...errors, description: false })); }} placeholder="Describe the quest..." rows={2} aria-invalid={questFormErrors.description}
              className={`w-full p-2.5 text-xs bg-zinc-950 border rounded-xl text-white focus:outline-none focus:border-amber-500 ${questFormErrors.description ? 'border-red-500 ring-1 ring-red-500/50' : 'border-zinc-700'}`} />
              {questFormErrors.description && <p className="mt-1.5 text-[11px] text-red-400">A description is required.</p>}
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-zinc-300">From</p>
              <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-zinc-300">
                <span>{personForRole(formCreatorRole).avatar}</span><span>{personForRole(formCreatorRole).name}{formCreatorRole === user.role ? ' (you)' : ''}</span>
              </div>
            </div>
            <div>
              <label htmlFor="quest-recipient" className="block mb-1.5 text-[11px] font-semibold text-zinc-300">For</label>
              <select id="quest-recipient" value={newChallengeAssignedTo} onChange={(e) => setNewChallengeAssignedTo(e.target.value as 'partner1' | 'partner2')}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                {(['partner1', 'partner2'] as const).map((role) => <option key={role} value={role}>{personForRole(role).name}{role === user.role ? ' (you)' : ''}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quest-reward" className="block mb-1.5 text-[11px] font-semibold text-zinc-300">Optional reward on completion</label>
              <select id="quest-reward" value={newChallengeRewardId} onChange={(e) => setNewChallengeRewardId(e.target.value)} className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                <option value="">No extra reward</option>
                {rewards.map((reward) => <option key={reward.id} value={reward.id}>{reward.title}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowChallengeModal(false); setEditingChallengeId(null); setQuestFormErrors({ heading: false, description: false }); }} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl">{editingChallengeId ? 'Save changes' : 'Create'}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {showDiceEditor && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveDiceDeck} className="w-full max-w-lg rounded-3xl border border-cyan-500/25 bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="text-sm font-bold text-white">{isCreatingDiceDeck ? 'Create Reveal Dice Deck' : 'Edit Reveal Dice Deck'}</h3><p className="mt-1 text-xs text-zinc-400">Add six prompts—one for every die face.</p></div>
              <input value={diceDeckEmojiDraft} onChange={(e) => setDiceDeckEmojiDraft(e.target.value)} maxLength={2} aria-label="Deck emoji" className="w-12 rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-center text-lg text-white outline-none focus:border-cyan-400" />
            </div>
            <input value={diceDeckNameDraft} onChange={(e) => setDiceDeckNameDraft(e.target.value)} placeholder="Deck name" required className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {diceItemDrafts.map((item, index) => (
                <label key={index} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2 text-xs text-zinc-400">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 font-bold text-cyan-300">{index + 1}</span>
                  <input value={item} onChange={(e) => setDiceItemDrafts((items) => items.map((draft, itemIndex) => itemIndex === index ? e.target.value : draft))} placeholder={`Prompt for ${index + 1}`} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600" />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowDiceEditor(false)} className="px-3 py-2 text-xs text-zinc-400 hover:text-white">Cancel</button>
              <button type="submit" className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-cyan-300">{isCreatingDiceDeck ? 'Save deck' : 'Save changes'}</button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
