export type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  role: 'partner1' | 'partner2';
};

export type Couple = {
  id: string;
  code: string;
  partner1Name: string;
  partner2Name: string;
  partner1Avatar: string;
  partner2Avatar: string;
  anniversaryDate: string; // YYYY-MM-DD
  points: {
    partner1: number;
    partner2: number;
  };
  privatePin: string; // 4-digit PIN default "1234"
};

export type MessageType = 'text' | 'kiss' | 'nudge' | 'hug' | 'love-note' | 'image';

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  timestamp: string;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of userIds
};

export type BingoTile = {
  id: string;
  text: string;
  completedBy: string[]; // array of userIds who marked it
};

export type BingoCard = {
  id: string;
  name: string;
  emoji: string;
  theme: 'romantic' | 'cozy' | 'spicy' | 'funny' | 'custom';
  tiles: BingoTile[]; // exactly 25 tiles
  isCustom?: boolean;
};

export type TruthOrDareCard = {
  id: string;
  type: 'truth' | 'dare';
  category: 'romantic' | 'deep' | 'spicy' | 'wild';
  prompt: string;
  points: number;
  isCustom?: boolean;
};

export type DiceDeck = {
  id: string;
  name: string;
  emoji: string;
  items: string[]; // exactly 6 prompts, one for each die face
  isCustom?: boolean;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  /** The partner who created the quest. */
  createdBy: 'partner1' | 'partner2';
  /** The partner this quest is intended for. */
  assignedTo: 'partner1' | 'partner2';
  points: number;
  rewardId?: string;
  rewardTriggered?: boolean;
  acceptedBy?: string;
  acceptedAt?: string;
  completedBy: {
    userId: string;
    completedAt: string;
    note?: string;
  }[];
  isCustom?: boolean;
};

export type DateIdea = {
  id: string;
  title: string;
  description: string;
  budget: '$' | '$$' | '$$$';
  mood: 'cozy' | 'adventurous' | 'romantic' | 'foodie';
  location: 'home' | 'outdoor' | 'nightout';
  completed: boolean;
  completedAt?: string;
  rating?: number; // 1-5
  notes?: string;
  isCustom?: boolean;
};

export type PrivateCard = {
  id: string;
  category: 'flirty' | 'steamy' | 'intimate' | 'fantasy';
  title: string;
  prompt: string;
  scratchRevealed?: boolean;
};

export type FantasyItem = {
  id: string;
  text: string;
  partner1Choice?: boolean;
  partner2Choice?: boolean;
  isCustom?: boolean;
};

export type HeatMeter = {
  partner1?: number;
  partner2?: number;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'intimacy' | 'service' | 'fun' | 'food';
  icon: string;
  createdBy: string;
  isCustom?: boolean;
};

export type RewardRedemption = {
  id: string;
  rewardId: string;
  rewardTitle: string;
  rewardCost: number;
  redeemedBy: string; // userId
  redeemedByName: string;
  redeemedAt: string;
  status: 'pending' | 'claimed' | 'rejected';
};
