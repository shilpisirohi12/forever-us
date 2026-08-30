'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Lock,
  Unlock,
  Flame,
  Eye,
  EyeOff,
  Dices,
  Sparkles,
  Heart,
  Plus,
  ShieldAlert,
  HelpCircle,
  Check,
  Pencil,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { fireConfetti } from '@/components/Confetti';
import { PrivateCard } from '@/lib/types';

export default function PrivateZonePage() {
  const {
    user,
    couple,
    lockPrivateZone,
    privateCards,
    fantasyItems,
    toggleFantasyChoice,
    addCustomFantasy,
    updateFantasyItem,
    deleteFantasyItem,
    heatMeter,
    setHeatMeterChoice,
    resetHeatMeter,
    disguiseMode,
    setDisguiseMode,
    privateSettings,
    updatePrivateSettings,
    showToast,
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'dice' | 'timer' | 'heat' | 'fantasies'>('cards');
  const [selectedTier, setSelectedTier] = useState<'all' | 'flirty' | 'steamy' | 'intimate' | 'fantasy'>('all');
  const [revealedCardIds, setRevealedCardIds] = useState<string[]>([]);

  // Dice States
  const [actions, setActions] = useState(['Kiss', 'Slow Nibble', 'Warm Massage', 'Feather Touch', 'Sensual Lick', 'Firm Caress']);
  const [bodyParts, setBodyParts] = useState(['Neck & Collarbone', 'Lips & Chin', 'Inner Thighs', 'Spine & Lower Back', 'Shoulders', 'Ears & Jaw']);
  const [modifiers, setModifiers] = useState(['For 2 Minutes', 'In Pure Candlelight', 'Blindfolded', 'With Ice Cube / Warmth', 'Passionately', 'Whispering in Ear']);

  const [diceAction, setDiceAction] = useState(actions[0]);
  const [diceBody, setDiceBody] = useState(bodyParts[0]);
  const [diceMod, setDiceMod] = useState(modifiers[0]);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [showDiceEditor, setShowDiceEditor] = useState(false);
  const [actionDrafts, setActionDrafts] = useState<string[]>(actions);
  const [bodyDrafts, setBodyDrafts] = useState<string[]>(bodyParts);
  const [modifierDrafts, setModifierDrafts] = useState<string[]>(modifiers);
  const defaultTeaseDurations = [30, 60, 120, 180, 300, 600];
  const [teaseDuration, setTeaseDuration] = useState(defaultTeaseDurations[0]);
  const [teaseRemaining, setTeaseRemaining] = useState(defaultTeaseDurations[0]);
  const [isTeaseTimerRunning, setIsTeaseTimerRunning] = useState(false);
  const [teaseDurations, setTeaseDurations] = useState(defaultTeaseDurations);
  const [teaseDurationDrafts, setTeaseDurationDrafts] = useState(defaultTeaseDurations.map(String));
  const [showTeaseTimerEditor, setShowTeaseTimerEditor] = useState(false);

  useEffect(() => {
    const { pleasureDice, teaseTimerDurations } = privateSettings;
    if (pleasureDice.actions.length === 6 && pleasureDice.bodyParts.length === 6 && pleasureDice.modifiers.length === 6) {
      setActions(pleasureDice.actions);
      setBodyParts(pleasureDice.bodyParts);
      setModifiers(pleasureDice.modifiers);
    }
    if (teaseTimerDurations.length === 6 && teaseTimerDurations.every((duration) => Number.isInteger(duration) && duration >= 5 && duration <= 3600)) {
      setTeaseDurations(teaseTimerDurations);
      setTeaseDuration(teaseTimerDurations[0]);
      setTeaseRemaining(teaseTimerDurations[0]);
    }
  }, [privateSettings]);

  useEffect(() => {
    if (!isTeaseTimerRunning) return;
    const timer = window.setInterval(() => {
      setTeaseRemaining((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          setIsTeaseTimerRunning(false);
          showToast('Time is up! 🔥', 'spicy');
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isTeaseTimerRunning, showToast]);

  // Custom Fantasy Form
  const [showAddFantasy, setShowAddFantasy] = useState(false);
  const [newFantasyText, setNewFantasyText] = useState('');
  const [editingFantasyId, setEditingFantasyId] = useState<string | null>(null);
  const [editingFantasyText, setEditingFantasyText] = useState('');

  const partnerName = user.role === 'partner1' ? couple.partner2Name : couple.partner1Name;
  const myHeat = heatMeter[user.role];
  const partnerRole = user.role === 'partner1' ? 'partner2' : 'partner1';
  const partnerHeat = heatMeter[partnerRole];
  const isHeatRevealed = myHeat !== undefined && partnerHeat !== undefined;

  // Kept only for the retired keypad markup below; Google authentication now gates access.
  const handlePinSubmit = () => {};
  const handleKeypadPress = (_digit: string) => {};

  const handleRollDice = () => {
    setIsRollingDice(true);
    let count = 0;
    const interval = setInterval(() => {
      setDiceAction(actions[Math.floor(Math.random() * actions.length)]);
      setDiceBody(bodyParts[Math.floor(Math.random() * bodyParts.length)]);
      setDiceMod(modifiers[Math.floor(Math.random() * modifiers.length)]);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsRollingDice(false);
        fireConfetti();
        showToast('The Pleasure Dice have spoken! 🔥', 'spicy');
      }
    }, 80);
  };

  const openDiceEditor = () => {
    setActionDrafts(actions);
    setBodyDrafts(bodyParts);
    setModifierDrafts(modifiers);
    setShowDiceEditor(true);
  };

  const saveDiceEditor = (e: React.FormEvent) => {
    e.preventDefault();
    const nextActions = actionDrafts.map((item) => item.trim()).filter(Boolean);
    const nextBodyParts = bodyDrafts.map((item) => item.trim()).filter(Boolean);
    const nextModifiers = modifierDrafts.map((item) => item.trim()).filter(Boolean);
    if (nextActions.length !== 6 || nextBodyParts.length !== 6 || nextModifiers.length !== 6) {
      showToast('Please fill in all 6 options for each die.', 'info');
      return;
    }
    setActions(nextActions);
    setBodyParts(nextBodyParts);
    setModifiers(nextModifiers);
    setDiceAction(nextActions[0]);
    setDiceBody(nextBodyParts[0]);
    setDiceMod(nextModifiers[0]);
    updatePrivateSettings({ pleasureDice: { actions: nextActions, bodyParts: nextBodyParts, modifiers: nextModifiers } });
    setShowDiceEditor(false);
    showToast('Pleasure Dice updated!', 'success');
  };

  const chooseRandomTeaseDuration = () => {
    const duration = teaseDurations[Math.floor(Math.random() * teaseDurations.length)];
    setTeaseDuration(duration);
    setTeaseRemaining(duration);
    setIsTeaseTimerRunning(false);
  };

  const openTeaseTimerEditor = () => {
    setTeaseDurationDrafts(teaseDurations.map(String));
    setShowTeaseTimerEditor(true);
  };

  const saveTeaseTimerDurations = (e: React.FormEvent) => {
    e.preventDefault();
    const durations = teaseDurationDrafts.map((value) => Number(value));
    if (durations.some((duration) => !Number.isInteger(duration) || duration < 5 || duration > 3600)) {
      showToast('Enter six whole-number durations between 5 and 3,600 seconds.', 'info');
      return;
    }
    setTeaseDurations(durations);
    setTeaseDuration(durations[0]);
    setTeaseRemaining(durations[0]);
    setIsTeaseTimerRunning(false);
    updatePrivateSettings({ teaseTimerDurations: durations });
    setShowTeaseTimerEditor(false);
    showToast('Tease Timer choices updated!', 'success');
  };

  const toggleRevealCard = (id: string) => {
    setRevealedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddFantasy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFantasyText.trim()) return;
    addCustomFantasy(newFantasyText.trim());
    setNewFantasyText('');
    setShowAddFantasy(false);
  };

  const handleEditFantasy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFantasyId || !editingFantasyText.trim()) return;
    updateFantasyItem(editingFantasyId, editingFantasyText);
    setEditingFantasyId(null);
    setEditingFantasyText('');
  };

  // 1. DISGUISE / PANIC SCREEN (If triggered by user to pretend it's a grocery / recipe note!)
  if (disguiseMode) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white text-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold">🛒 Weekend Grocery & Recipe List</h2>
          <button
            onClick={() => setDisguiseMode(false)}
            className="text-xs text-zinc-400 hover:text-zinc-600"
          >
            Done
          </button>
        </div>
        <ul className="text-sm space-y-2 list-disc list-inside text-zinc-600">
          <li>Almond milk & Greek yogurt</li>
          <li>Fresh sourdough bread</li>
          <li>Olive oil, garlic & fresh basil</li>
          <li>Dark roast coffee beans</li>
          <li>Sparkling mineral water</li>
        </ul>
      </div>
    );
  }

  // 2. LOCKED SCREEN WITH 4-DIGIT PIN KEYPAD
  if (false) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-b from-red-950/40 via-zinc-950 to-zinc-950 border border-red-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-black text-white">Private & Flirty Zone</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enter 4-digit PIN to access intimate cards, sensual dice, and mutual desires.
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 my-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pinInput.length > idx
                  ? 'bg-red-500 border-red-400 scale-110 shadow-lg shadow-red-500/50'
                  : 'bg-zinc-900 border-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'C') setPinInput('');
                else if (key === '✓') handlePinSubmit();
                else handleKeypadPress(key);
              }}
              className="py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/40 text-lg font-bold text-white transition active:scale-95 shadow-md"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. UNLOCKED PRIVATE ZONE
  const filteredCards = privateCards.filter(
    (c) => selectedTier === 'all' || c.category === selectedTier
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in pb-12">
      {/* Header with Quick Panic/Lock Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Flame className="w-5 h-5 fill-red-500/40" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white">Private Zone</h1>
            <p className="text-[11px] text-red-300/80">Intimate space for {couple.partner1Name} & {couple.partner2Name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Panic / Disguise Mode */}
          <button
            onClick={() => setDisguiseMode(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-xs transition"
            title="Instant Grocery Disguise"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Disguise</span>
          </button>

          {/* Lock Button */}
          <button
            onClick={lockPrivateZone}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold transition"
            title="Lock Private Zone"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'cards'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Spicy Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('dice')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'dice'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Pleasure Dice</span>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'timer'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Tease Timer</span>
        </button>

        <button
          onClick={() => setActiveTab('fantasies')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'fantasies'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Desire Matcher</span>
        </button>
        <button
          onClick={() => setActiveTab('heat')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'heat'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Heat Meter</span>
        </button>
      </div>

      {/* TAB 1: SPICY & FLIRTY SCRATCH/FLIP CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'flirty', label: '💋 Flirty' },
              { id: 'steamy', label: '🔥 Steamy' },
              { id: 'intimate', label: '❤️ Intimate' },
              { id: 'fantasy', label: '✨ Fantasy' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id as any)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedTier === tier.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const isRevealed = revealedCardIds.includes(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => toggleRevealCard(card.id)}
                  className="cursor-pointer group relative p-5 rounded-3xl bg-zinc-900/90 border border-red-500/20 hover:border-red-500/50 transition-all duration-200 shadow-xl overflow-hidden min-h-[160px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-500/30">
                      {card.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {isRevealed ? <Eye className="w-3.5 h-3.5 text-red-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </span>
                  </div>

                  {/* Card Content or Scratch Cover */}
                  {isRevealed ? (
                    <div className="my-auto py-2 animate-fade-in">
                      <h4 className="text-sm font-bold text-white mb-1">{card.title}</h4>
                      <p className="text-xs text-rose-200/90 leading-relaxed">{card.prompt}</p>
                    </div>
                  ) : (
                    <div className="my-auto py-4 text-center space-y-1">
                      <div className="text-2xl">🤫</div>
                      <h4 className="text-sm font-bold text-zinc-300">{card.title}</h4>
                      <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">
                        Tap to scratch & reveal
                      </p>
                    </div>
                  )}

                  <div className="text-[9px] text-zinc-500 text-right">
                    {isRevealed ? 'Tap to hide' : 'Secret Intimate Card'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PLEASURE & ROMANCE DICE */}
      {activeTab === 'dice' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 via-zinc-900 to-zinc-900 border-2 border-red-500/30 shadow-2xl text-center space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              Sensual Generator
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">Pleasure & Passion Dice</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Roll the 3 dice to craft your next spontaneous intimate rendezvous.
            </p>
          </div>

          <button onClick={openDiceEditor} className="mx-auto inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-red-500/40 hover:text-white">
            <Pencil className="h-3.5 w-3.5" /> Edit dice options
          </button>

          {/* 3 Dice Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dice 1: Action */}
            <div
              className={`p-4 rounded-2xl bg-zinc-950 border border-red-500/40 space-y-1 transition-all ${
                isRollingDice ? 'scale-95 animate-bounce' : ''
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-zinc-500">Action</span>
              <div className="text-base sm:text-lg font-black text-rose-300">{diceAction}</div>
            </div>

            {/* Dice 2: Target Body Part */}
            <div
              className={`p-4 rounded-2xl bg-zinc-950 border border-red-500/40 space-y-1 transition-all ${
                isRollingDice ? 'scale-95 animate-bounce delay-75' : ''
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-zinc-500">Body Part</span>
              <div className="text-base sm:text-lg font-black text-red-300">{diceBody}</div>
            </div>

            {/* Dice 3: Modifier */}
            <div
              className={`p-4 rounded-2xl bg-zinc-950 border border-red-500/40 space-y-1 transition-all ${
                isRollingDice ? 'scale-95 animate-bounce delay-150' : ''
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-zinc-500">Vibe / Mod</span>
              <div className="text-base sm:text-lg font-black text-pink-300">{diceMod}</div>
            </div>
          </div>

          {/* Roll Button */}
          <button
            onClick={handleRollDice}
            disabled={isRollingDice}
            className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-950/60 transition active:scale-95 disabled:opacity-50"
          >
            <Dices className={`w-4 h-4 ${isRollingDice ? 'animate-spin' : ''}`} />
            <span>{isRollingDice ? 'Rolling Dice...' : 'Roll Pleasure Dice'}</span>
          </button>
        </div>
      )}

      {showDiceEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveDiceEditor} className="w-full max-w-2xl space-y-4 rounded-3xl border border-red-500/30 bg-zinc-900 p-5 shadow-2xl">
            <div><h3 className="text-sm font-bold text-white">Edit Pleasure Dice</h3><p className="mt-1 text-xs text-zinc-400">Each die needs six options. Changes are saved privately on this device.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Actions', drafts: actionDrafts, setDrafts: setActionDrafts },
                { title: 'Body Parts', drafts: bodyDrafts, setDrafts: setBodyDrafts },
                { title: 'Vibes / Mods', drafts: modifierDrafts, setDrafts: setModifierDrafts },
              ].map((group) => (
                <div key={group.title} className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-300">{group.title}</h4>
                  {group.drafts.map((value, index) => (
                    <label key={index} className="flex items-center gap-1.5"><span className="w-4 text-[10px] font-bold text-zinc-500">{index + 1}</span><input value={value} onChange={(e) => group.setDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white outline-none focus:border-red-400" /></label>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowDiceEditor(false)} className="px-3 py-2 text-xs text-zinc-400 hover:text-white">Cancel</button><button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500">Save dice</button></div>
          </form>
        </div>
      )}

      {/* TAB 3: TEASE TIMER */}
      {activeTab === 'timer' && (
        <div className="mx-auto max-w-lg space-y-6 rounded-3xl border-2 border-pink-500/30 bg-gradient-to-br from-red-950/45 via-zinc-900 to-zinc-900 p-6 text-center shadow-2xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Playful countdown</span>
            <h3 className="mt-1 text-xl font-black text-white">Tease Timer</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">Pick a surprise timer, then press start.</p>
          </div>

          <button type="button" onClick={openTeaseTimerEditor} className="mx-auto inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-pink-500/50 hover:text-white">
            <Pencil className="h-3.5 w-3.5" /> Edit timer choices
          </button>

          <div className="rounded-3xl border border-pink-500/30 bg-zinc-950/70 px-5 py-8 shadow-inner shadow-pink-950/40">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Selected duration: {Math.floor(teaseDuration / 60) > 0 ? `${Math.floor(teaseDuration / 60)}m ` : ''}{teaseDuration % 60 > 0 ? `${teaseDuration % 60}s` : ''}</p>
            <output aria-live="polite" className="mt-2 block font-mono text-6xl font-black tracking-tight text-pink-200 sm:text-7xl">
              {String(Math.floor(teaseRemaining / 60)).padStart(2, '0')}:{String(teaseRemaining % 60).padStart(2, '0')}
            </output>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={chooseRandomTeaseDuration}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:border-pink-500/50 hover:text-white"
            >
              Random time
            </button>
            <button
              type="button"
              onClick={() => {
                if (teaseRemaining === 0) setTeaseRemaining(teaseDuration);
                setIsTeaseTimerRunning((isRunning) => !isRunning);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-3 py-2.5 text-xs font-black text-white transition hover:from-red-500 hover:to-pink-500"
            >
              {isTeaseTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isTeaseTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTeaseTimerRunning(false);
                setTeaseRemaining(teaseDuration);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:border-pink-500/50 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {showTeaseTimerEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveTeaseTimerDurations} className="w-full max-w-md space-y-5 rounded-3xl border border-pink-500/30 bg-zinc-900 p-5 shadow-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Edit Tease Timer choices</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">Set the six durations used by Random time. Use whole seconds from 5 to 3,600.</p>
            </div>
            <div className="space-y-3">
              {teaseDurationDrafts.map((value, index) => (
                <label key={index} className="block text-xs font-semibold text-zinc-300">
                  Timer {index + 1} <span className="font-normal text-zinc-500">(seconds)</span>
                  <input
                    type="number"
                    min="5"
                    max="3600"
                    step="1"
                    value={value}
                    onChange={(e) => setTeaseDurationDrafts((drafts) => drafts.map((draft, draftIndex) => draftIndex === index ? e.target.value : draft))}
                    className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-400"
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowTeaseTimerEditor(false)} className="px-3 py-2 text-xs text-zinc-400 transition hover:text-white">Cancel</button>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-4 py-2 text-xs font-bold text-white transition hover:from-red-500 hover:to-pink-500">Save choices</button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PRIVATE HEAT METER */}
      {activeTab === 'heat' && (
        <div className="mx-auto max-w-lg space-y-5 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/45 via-zinc-900 to-zinc-900 p-6 text-center shadow-2xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Private check-in</span>
            <h3 className="mt-1 text-xl font-black text-white">Heat Meter</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">Choose how you&apos;re feeling from 1 to 5. Your choice stays hidden until both of you have answered.</p>
          </div>

          {!isHeatRevealed ? (
            <>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button key={level} onClick={() => setHeatMeterChoice(level)} className={`flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm font-black transition active:scale-95 ${myHeat === level ? 'border-red-300 bg-red-500 text-white shadow-lg shadow-red-950/50' : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-red-500/50 hover:text-red-200'}`}>
                    <span>{level}</span><Flame className={`mt-1 h-3.5 w-3.5 ${level >= 4 ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400">
                {myHeat ? `Your level is saved. Waiting for ${partnerName} to choose.` : 'Your partner cannot see your choice yet.'}
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">You</p><p className="mt-1 text-3xl font-black text-white">{myHeat} <Flame className="inline h-5 w-5 fill-red-400 text-red-400" /></p></div>
                <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-pink-300">{partnerName}</p><p className="mt-1 text-3xl font-black text-white">{partnerHeat} <Flame className="inline h-5 w-5 fill-red-400 text-red-400" /></p></div>
              </div>
              <p className="text-sm font-semibold text-rose-100">Your shared heat is {Math.round((myHeat + partnerHeat) / 2)} / 5</p>
              <button onClick={resetHeatMeter} className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-red-500/40 hover:text-white">Start a new check-in</button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SECRET MUTUAL FANTASY MATCHER */}
      {activeTab === 'fantasies' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">How the Desire Matcher works:</span>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Vote on things you want to try. Your answers remain 100% hidden from your partner
                until BOTH of you vote YES on the same desire!
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowAddFantasy(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Desire</span>
            </button>
          </div>

          <div className="space-y-3">
            {fantasyItems.map((item) => {
              const myVote = user.role === 'partner1' ? item.partner1Choice : item.partner2Choice;
              const isMatch = Boolean(item.partner1Choice && item.partner2Choice);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMatch
                      ? 'bg-gradient-to-r from-red-950/60 via-pink-950/40 to-zinc-900 border-red-500/50 shadow-lg shadow-red-950/30'
                      : 'bg-zinc-900/80 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {isMatch && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-red-600 text-white animate-pulse">
                            🔥 Mutual Match!
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          {item.text}
                        </h4>
                      </div>

                      <p className="text-[10px] text-zinc-400">
                        {isMatch
                          ? `Both you and ${partnerName} said YES!`
                          : myVote
                          ? 'You voted YES. Waiting for partner...'
                          : 'Secretly vote if you are open to this.'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${item.text}`}
                        onClick={() => {
                          setEditingFantasyId(item.id);
                          setEditingFantasyText(item.text);
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-zinc-400 transition hover:border-red-500/50 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.text}`}
                        onClick={() => {
                          if (window.confirm('Delete this desire? This cannot be undone.')) deleteFantasyItem(item.id);
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-zinc-400 transition hover:border-red-500/50 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFantasyChoice(item.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                          myVote
                            ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {myVote ? '✓ I Want This' : '+ Interested'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Fantasy Modal */}
      {showAddFantasy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleAddFantasy}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Add Secret Desire</h3>
            <p className="text-xs text-zinc-400">
              Only revealed if {partnerName} votes Yes as well!
            </p>

            <textarea
              value={newFantasyText}
              onChange={(e) => setNewFantasyText(e.target.value)}
              placeholder="e.g. Trying a new massage technique in candlelit bath..."
              rows={3}
              className="w-full p-3 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFantasy(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl"
              >
                Add Anonymous Desire
              </button>
            </div>
          </form>
        </div>
      )}

      {editingFantasyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleEditFantasy} className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Edit Desire</h3>
              <p className="mt-1 text-xs text-zinc-400">Editing keeps both partners&apos; existing votes.</p>
            </div>
            <textarea
              value={editingFantasyText}
              onChange={(e) => setEditingFantasyText(e.target.value)}
              rows={3}
              autoFocus
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingFantasyId(null)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
              <button type="submit" className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
