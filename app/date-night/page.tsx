'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  HeartHandshake,
  Sparkles,
  Shuffle,
  Plus,
  Star,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  Smile,
  Flame,
  Pencil,
  Trash2,
} from 'lucide-react';
import { fireConfetti } from '@/components/Confetti';
import { DateIdea } from '@/lib/types';

export default function DateNightPage() {
  const { user, couple, dateIdeas, toggleDateCompleted, addCustomDateIdea, updateDateIdea, deleteDateIdea, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'generator' | 'bucketlist' | 'memories'>('generator');

  // Generator Filters
  const [filterBudget, setFilterBudget] = useState<string>('all');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [pickedDate, setPickedDate] = useState<DateIdea | null>(dateIdeas[0] || null);

  // Add custom date modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDate, setEditingDate] = useState<DateIdea | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBudget, setNewBudget] = useState<'$' | '$$' | '$$$'>('$$');
  const [newMood, setNewMood] = useState<'cozy' | 'adventurous' | 'romantic' | 'foodie'>('romantic');
  const [newLocation, setNewLocation] = useState<'home' | 'outdoor' | 'nightout'>('nightout');

  // Review modal
  const [reviewingDate, setReviewingDate] = useState<DateIdea | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewNotes, setReviewNotes] = useState('');

  const completedDates = dateIdeas.filter((d) => d.completed);
  const pendingDates = dateIdeas.filter((d) => !d.completed);

  const eligibleForSpin = dateIdeas.filter((d) => {
    if (filterBudget !== 'all' && d.budget !== filterBudget) return false;
    if (filterMood !== 'all' && d.mood !== filterMood) return false;
    if (filterLocation !== 'all' && d.location !== filterLocation) return false;
    return true;
  });

  const handleSpin = () => {
    if (eligibleForSpin.length === 0) {
      showToast('No dates match your selected filters! Try broader filters.', 'info');
      return;
    }
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * eligibleForSpin.length);
      setPickedDate(eligibleForSpin[randomIdx]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsSpinning(false);
        fireConfetti();
        showToast('Found your perfect date night! 🥂', 'love');
      }
    }, 100);
  };

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const values = { title: newTitle.trim(), description: newDesc.trim(), budget: newBudget, mood: newMood, location: newLocation };
    if (editingDate) updateDateIdea(editingDate.id, values);
    else addCustomDateIdea(values);
    setNewTitle('');
    setNewDesc('');
    setEditingDate(null);
    setShowAddModal(false);
  };

  const openDateEditor = (date: DateIdea) => {
    setEditingDate(date);
    setNewTitle(date.title);
    setNewDesc(date.description);
    setNewBudget(date.budget);
    setNewMood(date.mood);
    setNewLocation(date.location);
    setShowAddModal(true);
  };

  const openDateCreator = () => {
    setEditingDate(null);
    setNewTitle('');
    setNewDesc('');
    setNewBudget('$$');
    setNewMood('romantic');
    setNewLocation('nightout');
    setShowAddModal(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingDate) return;
    toggleDateCompleted(reviewingDate.id, rating, reviewNotes.trim() || undefined);
    setReviewingDate(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Date Night HQ</span>
        </div>
        <h1 className="text-2xl font-black text-white">Date Night & Memories</h1>
        <p className="text-xs text-zinc-400">
          Plan, spin, and cherish memorable dates with{' '}
          <span className="text-amber-300 font-semibold">
            {user.role === 'partner1' ? couple.partner2Name : couple.partner1Name}
          </span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'generator'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Date Roulette</span>
        </button>

        <button
          onClick={() => setActiveTab('bucketlist')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'bucketlist'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>Bucket List ({pendingDates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'memories'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>Memories ({completedDates.length})</span>
        </button>
      </div>

      {/* 1. DATE GENERATOR TAB */}
      {activeTab === 'generator' && (
        <div className="space-y-5">
          {/* Filters Card */}
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Customize Tonight&apos;s Vibe
            </span>

            {/* Budget */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Budget</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Any' },
                  { id: '$', label: '$ Cheap' },
                  { id: '$$', label: '$$ Medium' },
                  { id: '$$$', label: '$$$ Luxe' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setFilterBudget(b.id)}
                    className={`py-1.5 rounded-xl transition font-medium ${
                      filterBudget === b.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Mood</label>
              <div className="grid grid-cols-5 gap-1 text-[11px]">
                {[
                  { id: 'all', label: 'Any', emo: '✨' },
                  { id: 'cozy', label: 'Cozy', emo: '🛋️' },
                  { id: 'romantic', label: 'Romantic', emo: '🌹' },
                  { id: 'adventurous', label: 'Adventurous', emo: '🧗' },
                  { id: 'foodie', label: 'Foodie', emo: '🍕' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFilterMood(m.id)}
                    className={`py-1.5 rounded-xl transition font-medium flex flex-col items-center gap-0.5 ${
                      filterMood === m.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span>{m.emo}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Location</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Any' },
                  { id: 'home', label: '🏡 At Home' },
                  { id: 'outdoor', label: '🌲 Outdoor' },
                  { id: 'nightout', label: '🌃 Night Out' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setFilterLocation(l.id)}
                    className={`py-1.5 rounded-xl transition font-medium ${
                      filterLocation === l.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Date Card */}
          {pickedDate ? (
            <div
              className={`p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border-2 border-amber-500/40 shadow-2xl space-y-4 transition-all duration-300 ${
                isSpinning ? 'scale-95 opacity-70 blur-[1px]' : 'scale-100 opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {pickedDate.mood}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Budget: <span className="text-amber-400 font-bold">{pickedDate.budget}</span>
                  </span>
                </div>

                <span className="text-xs text-zinc-400 capitalize flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {pickedDate.location}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{pickedDate.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-2">
                  {pickedDate.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setReviewingDate(pickedDate)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark as Completed</span>
                </button>

                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black shadow-lg shadow-amber-950/40 transition active:scale-95 disabled:opacity-50"
                >
                  <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Rolling...' : 'Spin Again'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-900/60 rounded-3xl border border-zinc-800 text-zinc-400">
              No dates match your criteria. Try adjusting the filters!
            </div>
          )}
        </div>
      )}

      {/* 2. BUCKET LIST TAB */}
      {activeTab === 'bucketlist' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openDateCreator}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Idea</span>
            </button>
          </div>

          <div className="space-y-3">
            {pendingDates.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/30 transition flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                      {d.mood} • {d.budget}
                    </span>
                    <h4 className="text-sm font-bold text-white">{d.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-400">{d.description}</p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openDateEditor(d)} className="p-2 rounded-xl bg-zinc-800 hover:text-amber-300 text-zinc-400 transition" title="Edit date idea"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (window.confirm(`Delete “${d.title}”? This cannot be undone.`)) deleteDateIdea(d.id); }} className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 hover:text-red-300 text-zinc-400 transition" title="Delete date idea"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => setReviewingDate(d)} className="p-2 rounded-xl bg-zinc-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-zinc-400 transition" title="Mark Completed"><CheckCircle2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MEMORIES TAB */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          {completedDates.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 bg-zinc-900/60 rounded-3xl border border-zinc-800">
              No dates completed yet. Go on an adventure and stamp your first memory!
            </div>
          ) : (
            <div className="space-y-3">
              {completedDates.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-3xl bg-zinc-900/80 border border-emerald-500/30 space-y-2.5 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-bold text-white">{d.title}</h4>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openDateEditor(d)} className="rounded-lg p-1 text-zinc-400 transition hover:text-amber-300" title="Edit date idea"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if (window.confirm(`Delete “${d.title}”? This cannot be undone.`)) deleteDateIdea(d.id); }} className="rounded-lg p-1 text-zinc-400 transition hover:text-red-300" title="Delete date idea"><Trash2 className="w-3.5 h-3.5" /></button>
                      <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (d.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-600'
                          }`}
                        />
                      ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400">{d.description}</p>

                  {d.notes && (
                    <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-rose-200/90 italic">
                      &quot;{d.notes}&quot;
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1">
                    <span>
                      Completed on {d.completedAt ? new Date(d.completedAt).toLocaleDateString() : 'Recently'}
                    </span>
                    <span className="text-emerald-400 font-semibold">+25 Coins Earned</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mark Completed & Review Modal */}
      {reviewingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveReview}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Capture Date Memory ✨</h3>
            <p className="text-xs text-zinc-400">
              How was <span className="text-amber-300 font-bold">&quot;{reviewingDate.title}&quot;</span>?
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 text-lg transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= rating ? 'text-amber-400 fill-amber-400 scale-110' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Memories / Highlights Note</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. The pasta was delicious and we talked until 2 AM..."
                rows={3}
                className="w-full p-3 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewingDate(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
              >
                Save Memory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Custom Date Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleAddDate}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">{editingDate ? 'Edit Date Idea' : 'Add Date to Bucket List'}</h3>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Midnight Ice Cream Run"
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Details of the date..."
                rows={2}
                className="w-full p-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Budget</label>
                <select
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value as any)}
                  className="w-full p-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                >
                  <option value="$">$ Cheap</option>
                  <option value="$$">$$ Medium</option>
                  <option value="$$$">$$$ Luxury</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Mood</label>
                <select
                  value={newMood}
                  onChange={(e) => setNewMood(e.target.value as any)}
                  className="w-full p-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                >
                  <option value="romantic">Romantic</option>
                  <option value="cozy">Cozy</option>
                  <option value="adventurous">Adventurous</option>
                  <option value="foodie">Foodie</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Location</label>
              <select value={newLocation} onChange={(e) => setNewLocation(e.target.value as 'home' | 'outdoor' | 'nightout')} className="w-full p-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white">
                <option value="home">At Home</option><option value="outdoor">Outdoor</option><option value="nightout">Night Out</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditingDate(null); }}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
              >
                {editingDate ? 'Save Changes' : 'Add Idea'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
