'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Couple,
  UserProfile,
  Message,
  BingoCard,
  TruthOrDareCard,
  DiceDeck,
  Challenge,
  DateIdea,
  PrivateCard,
  FantasyItem,
  HeatMeter,
  Reward,
  RewardRedemption,
  MessageType,
} from '../types';
import {
  INITIAL_BINGO_CARDS,
  INITIAL_TRUTH_OR_DARE,
  INITIAL_DICE_DECKS,
  INITIAL_CHALLENGES,
  INITIAL_DATE_IDEAS,
  INITIAL_PRIVATE_CARDS,
  INITIAL_FANTASY_ITEMS,
  INITIAL_REWARDS,
  INITIAL_MESSAGES,
} from '../data/initialData';
import { createBrowserSupabaseClient, isSupabaseConfigured } from '../supabase/client';

interface AppContextType {
  // User & Couple
  user: UserProfile;
  couple: Couple;
  updateCoupleInfo: (data: Partial<Couple>) => void;
  addPoints: (role: 'partner1' | 'partner2', amount: number) => void;
  isCloudConnected: boolean;

  // Chat
  messages: Message[];
  sendMessage: (content: string, type?: MessageType) => void;
  addReaction: (messageId: string, emoji: string) => void;
  sendLoveAction: (type: 'kiss' | 'nudge' | 'hug' | 'love-note') => void;

  // Bingo
  bingoCards: BingoCard[];
  activeCardId: string;
  setActiveCardId: (id: string) => void;
  toggleBingoTile: (cardId: string, tileId: string) => void;
  resetBingoCard: (cardId: string) => void;
  deleteBingoCard: (cardId: string) => void;
  addCustomBingoCard: (name: string, emoji: string, tileTexts: string[]) => void;
  updateBingoCardName: (cardId: string, name: string) => void;
  updateBingoTile: (cardId: string, tileId: string, text: string) => void;
  shuffleBingoCard: (cardId: string) => void;
  reorderBingoTiles: (cardId: string, fromIndex: number, toIndex: number) => void;

  // Truth or Dare
  truthOrDareCards: TruthOrDareCard[];
  addCustomTruthOrDare: (card: Omit<TruthOrDareCard, 'id' | 'isCustom'>) => void;

  // Reveal Dice
  diceDecks: DiceDeck[];
  activeDiceDeckId: string;
  setActiveDiceDeckId: (id: string) => void;
  addDiceDeck: (name: string, emoji: string, items: string[]) => void;
  updateDiceDeck: (id: string, updates: Pick<DiceDeck, 'name' | 'emoji' | 'items'>) => void;

  // Challenges
  challenges: Challenge[];
  acceptChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string, note?: string, triggerReward?: boolean) => void;
  addCustomChallenge: (challenge: Omit<Challenge, 'id' | 'completedBy' | 'isCustom' | 'createdBy'>) => void;
  updateChallenge: (challengeId: string, updates: Pick<Challenge, 'title' | 'description' | 'assignedTo' | 'rewardId'>) => void;
  deleteChallenge: (challengeId: string) => void;

  // Date Night
  dateIdeas: DateIdea[];
  toggleDateCompleted: (id: string, rating?: number, notes?: string) => void;
  addCustomDateIdea: (idea: Omit<DateIdea, 'id' | 'completed' | 'isCustom'>) => void;
  updateDateIdea: (id: string, updates: Pick<DateIdea, 'title' | 'description' | 'budget' | 'mood' | 'location'>) => void;
  deleteDateIdea: (id: string) => void;

  // Private Zone
  isPrivateUnlocked: boolean;
  unlockPrivateZone: (pin: string) => boolean;
  lockPrivateZone: () => void;
  privateCards: PrivateCard[];
  fantasyItems: FantasyItem[];
  toggleFantasyChoice: (id: string) => void;
  addCustomFantasy: (text: string) => void;
  heatMeter: HeatMeter;
  setHeatMeterChoice: (level: number) => void;
  resetHeatMeter: () => void;
  disguiseMode: boolean;
  setDisguiseMode: (val: boolean) => void;

  // Rewards
  rewards: Reward[];
  redemptions: RewardRedemption[];
  redeemReward: (reward: Reward) => boolean;
  updateRedemptionStatus: (redemptionId: string, status: 'claimed' | 'rejected') => void;
  addCustomReward: (reward: Omit<Reward, 'id' | 'createdBy' | 'isCustom'>) => void;

  // Toast / Alert
  toast: { message: string; type: 'love' | 'success' | 'spicy' | 'info' } | null;
  showToast: (message: string, type?: 'love' | 'success' | 'spicy' | 'info') => void;
}

const DEFAULT_COUPLE: Couple = {
  id: 'couple-101',
  code: 'LOVE-2026',
  partner1Name: 'Gautam',
  partner2Name: 'Shilpi',
  partner1Avatar: '🤴',
  partner2Avatar: '👸',
  anniversaryDate: '2023-06-15',
  points: {
    partner1: 175,
    partner2: 140,
  },
  privatePin: '1234',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUserRole, setCurrentUserRole] = useState<'partner1' | 'partner2'>('partner1');
  const [couple, setCouple] = useState<Couple>(DEFAULT_COUPLE);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [bingoCards, setBingoCards] = useState<BingoCard[]>(INITIAL_BINGO_CARDS);
  const [activeCardId, setActiveCardIdState] = useState<string>(INITIAL_BINGO_CARDS[0].id);
  const [truthOrDareCards, setTruthOrDareCards] = useState<TruthOrDareCard[]>(INITIAL_TRUTH_OR_DARE);
  const [diceDecks, setDiceDecks] = useState<DiceDeck[]>(INITIAL_DICE_DECKS);
  const [activeDiceDeckId, setActiveDiceDeckIdState] = useState(INITIAL_DICE_DECKS[0].id);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>(INITIAL_DATE_IDEAS);
  const [privateCards, setPrivateCards] = useState<PrivateCard[]>(INITIAL_PRIVATE_CARDS);
  const [fantasyItems, setFantasyItems] = useState<FantasyItem[]>(INITIAL_FANTASY_ITEMS);
  const [heatMeter, setHeatMeter] = useState<HeatMeter>({});
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([
    {
      id: 'red-1',
      rewardId: 'r4',
      rewardTitle: 'Tonight’s Movie & Snack Dictator',
      rewardCost: 40,
      redeemedBy: 'partner2',
      redeemedByName: 'Shilpi',
      redeemedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'claimed',
    },
  ]);

  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);
  const [disguiseMode, setDisguiseMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'love' | 'success' | 'spicy' | 'info' } | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCouple = localStorage.getItem('forever_couple');
      if (savedCouple) {
        const parsed = JSON.parse(savedCouple);
        // Automatically upgrade default names if they were the previous placeholder names
        if (parsed.partner1Name === 'Taylor' && parsed.partner2Name === 'Alex') {
          parsed.partner1Name = 'Gautam';
          parsed.partner2Name = 'Shilpi';
          parsed.partner1Avatar = '🤴';
          parsed.partner2Avatar = '👸';
          localStorage.setItem('forever_couple', JSON.stringify(parsed));
        }
        if (
          parsed.partner1Name === 'Gautam' &&
          parsed.partner2Name === 'Shilpi' &&
          parsed.partner1Avatar === '👨' &&
          parsed.partner2Avatar === '👩'
        ) {
          parsed.partner1Avatar = '🤴';
          parsed.partner2Avatar = '👸';
          localStorage.setItem('forever_couple', JSON.stringify(parsed));
        }
        setCouple(parsed);
      }

      const savedRole = localStorage.getItem('forever_user_role');
      if (!isSupabaseConfigured() && (savedRole === 'partner1' || savedRole === 'partner2')) {
        setCurrentUserRole(savedRole);
      }

      const savedMessages = localStorage.getItem('forever_messages');
      if (savedMessages) setMessages(JSON.parse(savedMessages));

      const savedHeatMeter = localStorage.getItem('forever_heat_meter');
      if (savedHeatMeter) setHeatMeter(JSON.parse(savedHeatMeter));

      const savedBingo = localStorage.getItem('forever_bingo_cards');
      if (savedBingo) setBingoCards(JSON.parse(savedBingo));

      const savedDiceDecks = localStorage.getItem('forever_dice_decks');
      if (savedDiceDecks) setDiceDecks(JSON.parse(savedDiceDecks));
      const savedActiveDiceDeck = localStorage.getItem('forever_active_dice_deck');
      if (savedActiveDiceDeck) setActiveDiceDeckIdState(savedActiveDiceDeck);

      const savedActiveCard = localStorage.getItem('forever_active_card');
      if (savedActiveCard) setActiveCardIdState(savedActiveCard);

      const savedTod = localStorage.getItem('forever_tod');
      if (savedTod) setTruthOrDareCards(JSON.parse(savedTod));

      const savedChallenges = localStorage.getItem('forever_challenges');
      if (savedChallenges) setChallenges(JSON.parse(savedChallenges));

      const savedDates = localStorage.getItem('forever_dates');
      if (savedDates) setDateIdeas(JSON.parse(savedDates));

      const savedFantasies = localStorage.getItem('forever_fantasies');
      if (savedFantasies) setFantasyItems(JSON.parse(savedFantasies));

      const savedRewards = localStorage.getItem('forever_rewards');
      if (savedRewards) setRewards(JSON.parse(savedRewards));

      const savedRedemptions = localStorage.getItem('forever_redemptions');
      if (savedRedemptions) setRedemptions(JSON.parse(savedRedemptions));

      if (isSupabaseConfigured()) {
        setIsCloudConnected(true);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Save to LocalStorage helpers
  const saveState = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore write errors
    }
  }, []);

  const loadCloudCouple = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data: profile } = await supabase.from('profiles').select('couple_id, role').eq('id', authUser.id).maybeSingle();
    if (!profile?.couple_id) return;
    const { data: cloudCouple } = await supabase.from('couples').select('*').eq('id', profile.couple_id).maybeSingle();
    if (!cloudCouple) return;
    const nextCouple: Couple = {
      id: cloudCouple.id,
      code: cloudCouple.code,
      partner1Name: cloudCouple.partner1_name,
      partner2Name: cloudCouple.partner2_name,
      partner1Avatar: cloudCouple.partner1_avatar,
      partner2Avatar: cloudCouple.partner2_avatar,
      anniversaryDate: cloudCouple.anniversary_date,
      points: { partner1: cloudCouple.partner1_points, partner2: cloudCouple.partner2_points },
      privatePin: cloudCouple.private_pin,
    };
    setCouple(nextCouple);
    saveState('forever_couple', nextCouple);
    if (profile.role === 'partner1' || profile.role === 'partner2') {
      setCurrentUserRole(profile.role);
      localStorage.setItem('forever_user_role', profile.role);
    }
  }, [saveState]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    loadCloudCouple();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') loadCloudCouple();
    });
    return () => subscription.unsubscribe();
  }, [loadCloudCouple]);

  // Toast notification
  const showToast = useCallback((message: string, type: 'love' | 'success' | 'spicy' | 'info' = 'love') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Current user representation
  const user: UserProfile = {
    id: currentUserRole,
    name: currentUserRole === 'partner1' ? couple.partner1Name : couple.partner2Name,
    avatar: currentUserRole === 'partner1' ? couple.partner1Avatar : couple.partner2Avatar,
    role: currentUserRole,
  };

  const updateCoupleInfo = (data: Partial<Couple>) => {
    setCouple((prev) => {
      const updated = { ...prev, ...data };
      saveState('forever_couple', updated);
      return updated;
    });
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      void (async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', authUser.id).maybeSingle();
        if (!profile?.couple_id) return;
        const updates: Record<string, unknown> = {};
        if (data.partner1Name !== undefined) updates.partner1_name = data.partner1Name;
        if (data.partner2Name !== undefined) updates.partner2_name = data.partner2Name;
        if (data.partner1Avatar !== undefined) updates.partner1_avatar = data.partner1Avatar;
        if (data.partner2Avatar !== undefined) updates.partner2_avatar = data.partner2Avatar;
        if (data.anniversaryDate !== undefined) updates.anniversary_date = data.anniversaryDate;
        if (data.privatePin !== undefined) updates.private_pin = data.privatePin;
        if (data.points !== undefined) {
          updates.partner1_points = data.points.partner1;
          updates.partner2_points = data.points.partner2;
        }
        if (Object.keys(updates).length > 0) await supabase.from('couples').update(updates).eq('id', profile.couple_id);
      })();
    }
    showToast('Couple details updated!', 'success');
  };

  const addPoints = (role: 'partner1' | 'partner2', amount: number) => {
    setCouple((prev) => {
      const newPoints = {
        ...prev.points,
        [role]: Math.max(0, (prev.points[role] || 0) + amount),
      };
      const updated = { ...prev, points: newPoints };
      saveState('forever_couple', updated);
      return updated;
    });
  };

  // Chat Actions
  const sendMessage = (content: string, type: MessageType = 'text') => {
    if (!content.trim() && type === 'text') return;
    const newMsg: Message = {
      id: 'msg-' + Date.now() + Math.random().toString(36).substring(2, 6),
      senderId: user.id,
      senderName: user.name,
      content,
      type,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      saveState('forever_messages', updated);
      return updated;
    });
  };

  const sendLoveAction = (type: 'kiss' | 'nudge' | 'hug' | 'love-note') => {
    const actionMessages: Record<string, string> = {
      kiss: `💋 Sent a passionate kiss to ${user.role === 'partner1' ? couple.partner2Name : couple.partner1Name}!`,
      nudge: `💓 Sent a gentle heartbeat nudge: "Thinking of you right now!"`,
      hug: `🤗 Wrapped you in a warm, cozy embrace.`,
      'love-note': `✨ "You are my favorite thought every single day."`,
    };
    sendMessage(actionMessages[type] || 'Sent love!', type);
    showToast(actionMessages[type], 'love');
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || {};
        const userList = currentReactions[emoji] || [];
        const hasReacted = userList.includes(user.id);
        const updatedUsers = hasReacted ? userList.filter((uid) => uid !== user.id) : [...userList, user.id];

        const newReactions = { ...currentReactions, [emoji]: updatedUsers };
        if (updatedUsers.length === 0) delete newReactions[emoji];

        return { ...m, reactions: newReactions };
      });
      saveState('forever_messages', updated);
      return updated;
    });
  };

  // Bingo Actions
  const setActiveCardId = (id: string) => {
    setActiveCardIdState(id);
    localStorage.setItem('forever_active_card', id);
  };

  const toggleBingoTile = (cardId: string, tileId: string) => {
    setBingoCards((prev) => {
      const updated = prev.map((card) => {
        if (card.id !== cardId) return card;
        const newTiles = card.tiles.map((tile) => {
          if (tile.id !== tileId) return tile;
          const completed = tile.completedBy.includes(user.id);
          const newCompletedBy = completed
            ? tile.completedBy.filter((uid) => uid !== user.id)
            : [...tile.completedBy, user.id];
          if (!completed) {
            addPoints(user.role, 10);
            showToast(`Marked! (+10 Love Coins)`, 'love');
          }
          return { ...tile, completedBy: newCompletedBy };
        });
        return { ...card, tiles: newTiles };
      });
      saveState('forever_bingo_cards', updated);
      return updated;
    });
  };

  const resetBingoCard = (cardId: string) => {
    setBingoCards((prev) => {
      const updated = prev.map((card) => {
        if (card.id !== cardId) return card;
        return { ...card, tiles: card.tiles.map((t) => ({ ...t, completedBy: [] })) };
      });
      saveState('forever_bingo_cards', updated);
      return updated;
    });
    showToast('Bingo card reset!', 'info');
  };

  const deleteBingoCard = (cardId: string) => {
    setBingoCards((prev) => {
      const deletedIndex = prev.findIndex((card) => card.id === cardId);
      const updated = prev.filter((card) => card.id !== cardId);
      const nextActiveCard = updated[Math.min(Math.max(deletedIndex, 0), updated.length - 1)];

      saveState('forever_bingo_cards', updated);
      if (nextActiveCard) {
        setActiveCardIdState(nextActiveCard.id);
        localStorage.setItem('forever_active_card', nextActiveCard.id);
      } else {
        setActiveCardIdState('');
        localStorage.removeItem('forever_active_card');
      }
      return updated;
    });
    showToast('Bingo card deleted.', 'info');
  };

  const addCustomBingoCard = (name: string, emoji: string, tileTexts: string[]) => {
    const newCard: BingoCard = {
      id: 'card-custom-' + Date.now(),
      name,
      emoji,
      theme: 'custom',
      tiles: tileTexts.map((text, i) => ({
        id: 'cc-' + Date.now() + '-' + i,
        text,
        completedBy: [],
      })),
      isCustom: true,
    };
    setBingoCards((prev) => {
      const updated = [...prev, newCard];
      saveState('forever_bingo_cards', updated);
      return updated;
    });
    setActiveCardId(newCard.id);
    showToast(`Custom card "${name}" created!`, 'success');
  };

  const updateBingoCardName = (cardId: string, name: string) => {
    setBingoCards((prev) => {
      const updated = prev.map((card) => card.id === cardId ? { ...card, name } : card);
      saveState('forever_bingo_cards', updated);
      return updated;
    });
    showToast('Bingo card name updated!', 'success');
  };

  const updateBingoTile = (cardId: string, tileId: string, text: string) => {
    setBingoCards((prev) => {
      const updated = prev.map((card) => {
        if (card.id !== cardId) return card;
        return {
          ...card,
          tiles: card.tiles.map((tile) =>
            tile.id === tileId ? { ...tile, text } : tile
          ),
        };
      });
      saveState('forever_bingo_cards', updated);
      return updated;
    });
  };

  const shuffleBingoCard = (cardId: string) => {
    setBingoCards((prev) => {
      const updated = prev.map((card) => {
        if (card.id !== cardId) return card;
        // Separate center FREE SPACE tile
        const center = card.tiles[12];
        const isFreeCenter = center?.text.toLowerCase().startsWith('free');
        const others = isFreeCenter
          ? [...card.tiles.slice(0, 12), ...card.tiles.slice(13)]
          : [...card.tiles];
        // Fisher-Yates shuffle
        for (let i = others.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [others[i], others[j]] = [others[j], others[i]];
        }
        const newTiles = isFreeCenter
          ? [...others.slice(0, 12), center, ...others.slice(12)]
          : others;
        return { ...card, tiles: newTiles };
      });
      saveState('forever_bingo_cards', updated);
      return updated;
    });
    showToast('Squares shuffled! 🔀', 'info');
  };

  const reorderBingoTiles = (cardId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setBingoCards((prev) => {
      const updated = prev.map((card) => {
        if (card.id !== cardId) return card;
        const tiles = [...card.tiles];
        if (fromIndex >= tiles.length || toIndex >= tiles.length) return card;
        [tiles[fromIndex], tiles[toIndex]] = [tiles[toIndex], tiles[fromIndex]];
        return { ...card, tiles };
      });
      saveState('forever_bingo_cards', updated);
      return updated;
    });
  };

  // Truth or Dare
  const addCustomTruthOrDare = (card: Omit<TruthOrDareCard, 'id' | 'isCustom'>) => {
    const newCard: TruthOrDareCard = {
      ...card,
      id: 'tod-custom-' + Date.now(),
      isCustom: true,
    };
    setTruthOrDareCards((prev) => {
      const updated = [...prev, newCard];
      saveState('forever_tod', updated);
      return updated;
    });
    showToast(`Added new ${card.type.toUpperCase()} card!`, 'spicy');
  };

  // Reveal Dice
  const setActiveDiceDeckId = (id: string) => {
    setActiveDiceDeckIdState(id);
    localStorage.setItem('forever_active_dice_deck', id);
  };

  const addDiceDeck = (name: string, emoji: string, items: string[]) => {
    const newDeck: DiceDeck = {
      id: 'dice-custom-' + Date.now(),
      name,
      emoji,
      items: items.slice(0, 6),
      isCustom: true,
    };
    setDiceDecks((prev) => {
      const updated = [...prev, newDeck];
      saveState('forever_dice_decks', updated);
      return updated;
    });
    setActiveDiceDeckId(newDeck.id);
    showToast(`"${name}" dice deck created!`, 'success');
  };

  const updateDiceDeck = (id: string, updates: Pick<DiceDeck, 'name' | 'emoji' | 'items'>) => {
    setDiceDecks((prev) => {
      const updated = prev.map((deck) => deck.id === id ? { ...deck, ...updates, items: updates.items.slice(0, 6) } : deck);
      saveState('forever_dice_decks', updated);
      return updated;
    });
    showToast('Dice deck updated!', 'success');
  };

  // Challenges
  const acceptChallenge = (challengeId: string) => {
    let didAccept = false;
    setChallenges((prev) => {
      const updated = prev.map((challenge) => {
        const createdBy = challenge.createdBy ?? 'partner1';
        const assignedTo = challenge.assignedTo ?? (createdBy === 'partner1' ? 'partner2' : 'partner1');
        if (challenge.id !== challengeId || challenge.acceptedBy || assignedTo !== user.role) return challenge;
        didAccept = true;
        return { ...challenge, createdBy, assignedTo, acceptedBy: user.id, acceptedAt: new Date().toISOString() };
      });
      saveState('forever_challenges', updated);
      return updated;
    });
    if (didAccept) showToast('Request accepted. Time to make it happen!', 'love');
  };

  const completeChallenge = (challengeId: string, note?: string, triggerReward = false) => {
    setChallenges((prev) => {
      let earnedPoints = 0;
      const updated = prev.map((ch) => {
        if (ch.id !== challengeId) return ch;
        const createdBy = ch.createdBy ?? 'partner1';
        const assignedTo = ch.assignedTo ?? (createdBy === 'partner1' ? 'partner2' : 'partner1');
        const alreadyDone = ch.completedBy.some((c) => c.userId === user.id);
        if (alreadyDone || !ch.acceptedBy || assignedTo !== user.role) return ch;

        earnedPoints = ch.points;
        return {
          ...ch,
          createdBy,
          assignedTo,
          rewardTriggered: triggerReward && Boolean(ch.rewardId),
          completedBy: [...ch.completedBy, { userId: user.id, completedAt: new Date().toISOString(), note }],
        };
      });

      if (earnedPoints > 0) {
        addPoints(user.role, earnedPoints);
        showToast(triggerReward ? `Request completed! (+${earnedPoints} Love Coins) Reward triggered!` : `Request completed! (+${earnedPoints} Love Coins)`, 'success');
      }
      saveState('forever_challenges', updated);
      return updated;
    });
  };

  const addCustomChallenge = (challenge: Omit<Challenge, 'id' | 'completedBy' | 'isCustom' | 'createdBy'>) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: 'ch-custom-' + Date.now(),
      createdBy: user.role,
      completedBy: [],
      isCustom: true,
    };
    setChallenges((prev) => {
      const updated = [newChallenge, ...prev];
      saveState('forever_challenges', updated);
      return updated;
    });
    showToast('New couple challenge created!', 'success');
  };

  const updateChallenge = (challengeId: string, updates: Pick<Challenge, 'title' | 'description' | 'assignedTo' | 'rewardId'>) => {
    let didUpdate = false;
    setChallenges((prev) => {
      const updated = prev.map((challenge) => {
        if (challenge.id !== challengeId || challenge.completedBy.length > 0) return challenge;
        didUpdate = true;
        return { ...challenge, ...updates };
      });
      saveState('forever_challenges', updated);
      return updated;
    });
    if (didUpdate) showToast('Request updated!', 'success');
  };

  const deleteChallenge = (challengeId: string) => {
    setChallenges((prev) => {
      const updated = prev.filter((challenge) => challenge.id !== challengeId);
      saveState('forever_challenges', updated);
      return updated;
    });
    showToast('Quest deleted.', 'info');
  };

  // Date Night
  const toggleDateCompleted = (id: string, rating?: number, notes?: string) => {
    setDateIdeas((prev) => {
      const updated = prev.map((d) => {
        if (d.id !== id) return d;
        const willBeCompleted = !d.completed;
        if (willBeCompleted) {
          addPoints('partner1', 25);
          addPoints('partner2', 25);
          showToast('Date marked as completed! (+25 pts each 🎉)', 'love');
        }
        return {
          ...d,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          rating: rating ?? d.rating,
          notes: notes ?? d.notes,
        };
      });
      saveState('forever_dates', updated);
      return updated;
    });
  };

  const addCustomDateIdea = (idea: Omit<DateIdea, 'id' | 'completed' | 'isCustom'>) => {
    const newIdea: DateIdea = {
      ...idea,
      id: 'date-custom-' + Date.now(),
      completed: false,
      isCustom: true,
    };
    setDateIdeas((prev) => {
      const updated = [newIdea, ...prev];
      saveState('forever_dates', updated);
      return updated;
    });
    showToast('New Date idea added to bucket list!', 'success');
  };

  const updateDateIdea = (id: string, updates: Pick<DateIdea, 'title' | 'description' | 'budget' | 'mood' | 'location'>) => {
    setDateIdeas((prev) => {
      const updated = prev.map((idea) => idea.id === id ? { ...idea, ...updates } : idea);
      saveState('forever_dates', updated);
      return updated;
    });
    showToast('Date idea updated!', 'success');
  };

  const deleteDateIdea = (id: string) => {
    setDateIdeas((prev) => {
      const updated = prev.filter((idea) => idea.id !== id);
      saveState('forever_dates', updated);
      return updated;
    });
    showToast('Date idea deleted.', 'info');
  };

  // Private Zone
  const unlockPrivateZone = (pin: string): boolean => {
    if (pin === couple.privatePin) {
      setIsPrivateUnlocked(true);
      showToast('Private Zone unlocked 💋', 'spicy');
      return true;
    }
    showToast('Incorrect PIN. Please try again.', 'info');
    return false;
  };

  const lockPrivateZone = () => {
    setIsPrivateUnlocked(false);
    setDisguiseMode(false);
  };

  const toggleFantasyChoice = (id: string) => {
    setFantasyItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== id) return item;
        const key = user.role === 'partner1' ? 'partner1Choice' : 'partner2Choice';
        const newVal = !item[key];
        const matchNow = newVal && (user.role === 'partner1' ? item.partner2Choice : item.partner1Choice);

        if (matchNow) {
          showToast(`🔥 Mutual Match! Both of you want: "${item.text}"`, 'spicy');
        }
        return { ...item, [key]: newVal };
      });
      saveState('forever_fantasies', updated);
      return updated;
    });
  };

  const addCustomFantasy = (text: string) => {
    const newItem: FantasyItem = {
      id: 'f-custom-' + Date.now(),
      text,
      [user.role === 'partner1' ? 'partner1Choice' : 'partner2Choice']: true,
      isCustom: true,
    };
    setFantasyItems((prev) => {
      const updated = [...prev, newItem];
      saveState('forever_fantasies', updated);
      return updated;
    });
    showToast('Desire added anonymously. Waiting for partner!', 'spicy');
  };

  const setHeatMeterChoice = (level: number) => {
    if (!Number.isInteger(level) || level < 1 || level > 5) return;
    setHeatMeter((prev) => {
      const updated = { ...prev, [user.role]: level };
      saveState('forever_heat_meter', updated);
      return updated;
    });
    showToast('Your heat level is saved privately.', 'spicy');
  };

  const resetHeatMeter = () => {
    setHeatMeter({});
    saveState('forever_heat_meter', {});
    showToast('Heat Meter reset for a new round.', 'info');
  };

  // Rewards
  const redeemReward = (reward: Reward): boolean => {
    const currentPoints = couple.points[user.role] || 0;
    if (currentPoints < reward.cost) {
      showToast(`Not enough points! Need ${reward.cost - currentPoints} more Love Coins.`, 'info');
      return false;
    }

    // Deduct points
    addPoints(user.role, -reward.cost);

    const newRedemption: RewardRedemption = {
      id: 'red-' + Date.now(),
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardCost: reward.cost,
      redeemedBy: user.id,
      redeemedByName: user.name,
      redeemedAt: new Date().toISOString(),
      status: 'pending',
    };

    setRedemptions((prev) => {
      const updated = [newRedemption, ...prev];
      saveState('forever_redemptions', updated);
      return updated;
    });

    sendMessage(
      `🏆 ${user.name} just redeemed coupon: "${reward.title}" for ${reward.cost} Love Coins!`,
      'love-note'
    );
    showToast(`Coupon redeemed! Notified ${user.role === 'partner1' ? couple.partner2Name : couple.partner1Name}`, 'love');
    return true;
  };

  const updateRedemptionStatus = (redemptionId: string, status: 'claimed' | 'rejected') => {
    setRedemptions((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== redemptionId) return r;
        if (status === 'rejected') {
          // Refund points
          const role = r.redeemedBy as 'partner1' | 'partner2';
          addPoints(role, r.rewardCost);
        }
        return { ...r, status };
      });
      saveState('forever_redemptions', updated);
      return updated;
    });
    showToast(`Redemption marked as ${status}`, status === 'claimed' ? 'success' : 'info');
  };

  const addCustomReward = (reward: Omit<Reward, 'id' | 'createdBy' | 'isCustom'>) => {
    const newReward: Reward = {
      ...reward,
      id: 'r-custom-' + Date.now(),
      createdBy: user.id,
      isCustom: true,
    };
    setRewards((prev) => {
      const updated = [newReward, ...prev];
      saveState('forever_rewards', updated);
      return updated;
    });
    showToast('New Custom Love Coupon created!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        couple,
        updateCoupleInfo,
        addPoints,
        isCloudConnected,
        messages,
        sendMessage,
        addReaction,
        sendLoveAction,
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
        dateIdeas,
        toggleDateCompleted,
        addCustomDateIdea,
        updateDateIdea,
        deleteDateIdea,
        isPrivateUnlocked,
        unlockPrivateZone,
        lockPrivateZone,
        privateCards,
        fantasyItems,
        toggleFantasyChoice,
        addCustomFantasy,
        heatMeter,
        setHeatMeterChoice,
        resetHeatMeter,
        disguiseMode,
        setDisguiseMode,
        rewards,
        redemptions,
        redeemReward,
        updateRedemptionStatus,
        addCustomReward,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
