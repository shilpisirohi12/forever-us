'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, GripVertical, Pencil, RotateCcw, Shuffle, Trash2 } from 'lucide-react';
import { BingoCard } from '@/lib/types';

const THEME_STYLES: Record<string, { bg: string; border: string; gradient: string }> = {
  romantic: {
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/40',
    gradient: 'from-rose-600 to-pink-600',
  },
  cozy: {
    bg: 'bg-indigo-950/30',
    border: 'border-indigo-500/40',
    gradient: 'from-indigo-600 to-blue-600',
  },
  funny: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/40',
    gradient: 'from-amber-500 to-orange-500',
  },
  spicy: {
    bg: 'bg-red-950/30',
    border: 'border-red-500/40',
    gradient: 'from-red-600 to-rose-700',
  },
  custom: {
    bg: 'bg-violet-950/30',
    border: 'border-violet-500/40',
    gradient: 'from-violet-600 to-purple-600',
  },
};

type BingoBoardProps = {
  card: BingoCard;
  userId: string;
  partnerAvatar: string;
  onToggleTile: (tileId: string) => void;
  onReset: () => void;
  onDelete: () => void;
  onUpdateName: (name: string) => void;
  onShuffle: () => void;
  onUpdateTile: (tileId: string, text: string) => void;
  onReorderTiles: (fromIndex: number, toIndex: number) => void;
};

export default function BingoBoard({
  card,
  userId,
  partnerAvatar,
  onToggleTile,
  onReset,
  onDelete,
  onUpdateName,
  onShuffle,
  onUpdateTile,
  onReorderTiles,
}: BingoBoardProps) {
  const style = THEME_STYLES[card.theme] ?? THEME_STYLES.custom;
  const markedByMe = card.tiles.filter((t) => t.completedBy.includes(userId)).length;

  const [isEditing, setIsEditing] = useState(false);
  const [editingTileId, setEditingTileId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [cardNameDraft, setCardNameDraft] = useState(card.name);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const fromIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setIsEditing(false);
    setEditingTileId(null);
    setDragFrom(null);
    setDragOver(null);
  }, [card.id]);

  useEffect(() => {
    if (editingTileId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTileId]);

  const commitEdit = () => {
    if (!editingTileId) return;
    const next = editDraft.trim();
    if (next) onUpdateTile(editingTileId, next);
    setEditingTileId(null);
    setEditDraft('');
  };

  const commitCardName = () => {
    const next = cardNameDraft.trim();
    if (next && next !== card.name) onUpdateName(next);
  };

  const startEdit = (tileId: string, text: string) => {
    setEditingTileId(tileId);
    setEditDraft(text);
  };

  const tileIndexFromPoint = (x: number, y: number) => {
    const hits = document.elementsFromPoint(x, y);
    for (const el of hits) {
      const cell = (el as Element).closest?.('[data-bingo-index]') as HTMLElement | null;
      if (!cell) continue;
      const idx = Number(cell.dataset.bingoIndex);
      if (!Number.isFinite(idx)) continue;
      if (idx === fromIndexRef.current) continue;
      return idx;
    }
    return fromIndexRef.current;
  };

  const endDrag = () => {
    const from = fromIndexRef.current;
    const to = overIndexRef.current;
    if (dragging.current && from != null && to != null && from !== to) {
      onReorderTiles(from, to);
    }
    dragging.current = false;
    fromIndexRef.current = null;
    overIndexRef.current = null;
    pointerOrigin.current = null;
    setDragFrom(null);
    setDragOver(null);
  };

  const skipClick = useRef(false);
  const nativeDrag = useRef(false);

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    if (editingTileId) return;
    if (e.pointerType === 'touch') {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
    dragging.current = false;
    nativeDrag.current = false;
    fromIndexRef.current = index;
    overIndexRef.current = index;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    if (fromIndexRef.current == null || !pointerOrigin.current) return;
    const dx = e.clientX - pointerOrigin.current.x;
    const dy = e.clientY - pointerOrigin.current.y;
    if (!dragging.current && Math.hypot(dx, dy) < 10) return;
    e.preventDefault();
    dragging.current = true;
    setDragFrom(fromIndexRef.current);
    const over = tileIndexFromPoint(e.clientX, e.clientY);
    overIndexRef.current = over;
    setDragOver(over);
  };

  const handlePointerUp = (tileId: string, text: string, e: React.PointerEvent) => {
    if (nativeDrag.current) return;
    const wasDragging = dragging.current;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer was not captured
    }
    if (wasDragging) skipClick.current = true;
    endDrag();
    if (!wasDragging && isEditing) startEdit(tileId, text);
  };

  const handleNativeDragStart = (index: number, e: React.DragEvent) => {
    if (editingTileId) {
      e.preventDefault();
      return;
    }
    nativeDrag.current = true;
    skipClick.current = true;
    dragging.current = false;
    fromIndexRef.current = index;
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDragFrom(index);
  };

  const handleNativeDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    overIndexRef.current = index;
    setDragOver(index);
  };

  const handleNativeDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isFinite(from) && from !== index) {
      onReorderTiles(from, index);
    }
    nativeDrag.current = false;
    fromIndexRef.current = null;
    overIndexRef.current = null;
    setDragFrom(null);
    setDragOver(null);
  };

  const handleNativeDragEnd = () => {
    nativeDrag.current = false;
    fromIndexRef.current = null;
    overIndexRef.current = null;
    setDragFrom(null);
    setDragOver(null);
  };

  return (
    <div className={`rounded-3xl border ${style.border} shadow-2xl overflow-hidden`}>
      <div className={`px-4 py-3 flex items-center justify-between ${style.bg} border-b ${style.border}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{card.emoji}</span>
          <div>
            {isEditing ? (
              <input
                value={cardNameDraft}
                onChange={(e) => setCardNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitCardName(); } }}
                aria-label="Bingo card name"
                className="w-40 max-w-[42vw] rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm font-bold text-white outline-none focus:border-violet-400"
              />
            ) : (
              <p className="text-sm font-bold text-white">{card.name}</p>
            )}
            <p className="text-[11px] text-zinc-400">
              {isEditing ? 'Tap a square to edit · drag to swap' : `${markedByMe} / 25 marked · drag squares to swap`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <button
              type="button"
              onClick={() => {
                commitEdit();
                commitCardName();
                setIsEditing(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/80 border border-emerald-400/40 text-white text-[11px] font-semibold hover:bg-emerald-500 transition"
              title="Done editing"
            >
              <Check className="w-3.5 h-3.5" />
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setCardNameDraft(card.name); setIsEditing(true); }}
                className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-700 text-zinc-400 hover:text-white transition"
                title="Edit squares"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onShuffle}
                className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-700 text-zinc-400 hover:text-white transition"
                title="Shuffle squares"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onReset}
                className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-700 text-zinc-400 hover:text-white transition"
                title="Reset this card"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-300 transition"
                title="Delete this card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-3 bg-zinc-900/90">
        <div className="grid grid-cols-5 gap-1.5">
          {card.tiles.slice(0, 25).map((tile, index) => {
            const mine = tile.completedBy.includes(userId);
            const partnersOnly = tile.completedBy.some((id) => id !== userId) && !mine;
            const isFree = tile.text.toLowerCase().startsWith('free');
            const isDragging = dragFrom === index;
            const isDropTarget = dragOver === index && dragFrom !== index;
            const isTileEditing = editingTileId === tile.id;

            return (
              <div
                key={tile.id}
                data-bingo-index={index}
                role="button"
                tabIndex={isTileEditing ? -1 : 0}
                draggable={!isTileEditing}
                onPointerDown={(e) => handlePointerDown(index, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={(e) => handlePointerUp(tile.id, tile.text, e)}
                onPointerCancel={endDrag}
                onDragStart={(e) => handleNativeDragStart(index, e)}
                onDragOver={(e) => handleNativeDragOver(index, e)}
                onDrop={(e) => handleNativeDrop(index, e)}
                onDragEnd={handleNativeDragEnd}
                onClick={() => {
                  if (isTileEditing) return;
                  if (skipClick.current) {
                    skipClick.current = false;
                    return;
                  }
                  if (!isEditing) onToggleTile(tile.id);
                }}
                onKeyDown={(e) => {
                  if (isTileEditing) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isEditing) startEdit(tile.id, tile.text);
                    else onToggleTile(tile.id);
                  }
                }}
                className={`relative aspect-square rounded-xl border overflow-hidden transition-all duration-150 select-none touch-none cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 scale-95' : ''
                } ${
                  isDropTarget ? 'ring-2 ring-white/80 scale-[1.03]' : ''
                } ${
                  isTileEditing
                    ? 'border-violet-400 bg-zinc-950'
                    : mine && !isEditing
                    ? `bg-gradient-to-br ${style.gradient} border-transparent text-white shadow-md scale-[0.97]`
                    : isFree
                    ? `${style.bg} ${style.border} text-zinc-300`
                    : `bg-zinc-900/80 border-zinc-700/70 text-zinc-300 ${isEditing ? 'hover:border-zinc-500' : 'hover:border-zinc-500 hover:bg-zinc-800'}`
                }`}
              >
                {isTileEditing ? (
                  <textarea
                    ref={inputRef}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onBlur={commitEdit}
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        commitEdit();
                      }
                      if (e.key === 'Escape') {
                        setEditingTileId(null);
                        setEditDraft('');
                      }
                    }}
                    className="absolute inset-0 w-full h-full resize-none bg-transparent p-1 text-[9px] sm:text-[10px] text-center text-white leading-tight focus:outline-none"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center text-[9px] sm:text-[10px] font-medium leading-tight pointer-events-none">
                    <GripVertical className="absolute top-0.5 left-0.5 w-2.5 h-2.5 text-zinc-500 opacity-70" />
                    <span className="line-clamp-3 px-0.5">{tile.text}</span>
                    {!isEditing && partnersOnly && (
                      <span className="absolute top-0.5 right-0.5 text-[9px] pointer-events-none">
                        {partnerAvatar}
                      </span>
                    )}
                    {!isEditing && mine && (
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
