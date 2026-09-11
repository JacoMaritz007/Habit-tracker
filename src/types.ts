export type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
};

export type Habit = {
  id: string;
  title: string;
  description: string;
  completedDays: string[]; // ISO dates
  streak: number;
};

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: '1-year' | '3-year' | '5-year';
  obstacles?: string;
  partners?: string;
  knowledge?: string;
  plan?: string;
  why?: string;
};

export type GratitudeEntry = {
  id: string;
  date: string;
  content: string;
};

export type RitualEntry = {
  id: string;
  date: string;
  type: 'review' | 'planning' | 'celebration' | 'organization';
};

export type MoneyStoryResponse = {
  id: string;
  questionId: number;
  answer: string;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: any;
  xp: number;
  level: number;
  badges: string[]; // Badge IDs
  currency?: string;
  bio?: string;
  incomeRange?: string;
  primaryGoal?: string;
  wealthChallenge?: string;
  enneagramType?: string;
  photoAnalysis?: any;
};

export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  TRANSACTION_LOG: 5,
  HABIT_CREATE: 15,
  GOAL_SET: 20,
  GOAL_COMPLETE: 100,
  GRATITUDE_ENTRY: 10,
  RITUAL_LOG: 15,
  MONEY_STORY_ANSWER: 10,
  FREEDOM_CALC_SAVE: 50,
  PHOTO_ANALYSIS: 30,
};

export const PROGRESS_BADGES: Badge[] = [
  { id: 'first_habit', title: 'Habit Starter', description: 'Complete your first daily habit', icon: 'zap' },
  { id: 'habit_streak_7', title: 'Consistency King', description: 'Maintain a 7-day habit streak', icon: 'flame' },
  { id: 'first_goal', title: 'Goal Setter', description: 'Set your first wealth goal', icon: 'target' },
  { id: 'freedom_mapped', title: 'Cartographer', description: 'Complete the Freedom Calculator', icon: 'map' },
  { id: 'story_revealed', title: 'Truth Seeker', description: 'Complete your first Money Story question', icon: 'book-open' },
  { id: 'gratitude_pioneer', title: 'Abundance Mindset', description: 'Log your first gratitude entry', icon: 'sun' },
  { id: 'wealth_enneagram', title: 'Self-Aware', description: 'Discover your Enneagram Money Type', icon: 'user' },
  { id: 'transaction_master', title: 'Numbers Guy', description: 'Log 50 transactions', icon: 'file-text' },
];

export type EnneagramType = {
  id: number;
  title: string;
  description: string;
};

export type FreedomGoal = {
  id: string;
  title: string;
  cost: number;
};

export type FreedomCalculatorData = {
  id: string;
  userId: string;
  currency: string;
  
  // Step 1: Net Worth & Cash Flow
  monthlyEarnedIncome: number;
  monthlyPassiveIncome: number;
  monthlyExpenses: number;
  expenseBuffer: number; // Percentage (0.1, 0.25, etc.)
  
  assets: {
    bank: number;
    stocks: number;
    crypto: number;
    retirement: number;
    realEstate: number;
    business: number;
    alternative: number;
  };
  
  liabilities: {
    schoolLoans: number;
    creditCards: number;
    retailDebt: number;
    bankLoans: number;
    mortgages: number;
  };
  
  // Step 2: Freedom Number
  inflationRate: number; // Default 0.06
  withdrawalRate: number; // Default 0.04
  monthlyExpensesOverride?: number;
  freedomGoals: FreedomGoal[];
  
  // Step 3: Wealth Plan
  startingCapital: number;
  monthlyInvestment: number;
  annualIncrease: number; // Percentage
  targetIrr: number; // Percentage
  timelineYears: number;
  
  // Step 5: Wealth Rhythm (Checklist)
  rhythmStatus: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    quarterly: boolean;
    annually: boolean;
  };
  
  updatedAt: any;
};

export const ENNEAGRAM_TYPES: EnneagramType[] = [
  { id: 1, title: 'The Principled Saver', description: 'Disciplined and ethical with money, but can be overly rigid.' },
  { id: 2, title: 'The Generous Spender', description: 'Uses money to help others, sometimes neglecting own needs.' },
  { id: 3, title: 'The Success-Driven Investor', description: 'Views wealth as a measure of achievement and status.' },
  { id: 4, title: 'The Aesthete Spender', description: 'Values unique experiences and beauty over practical savings.' },
  { id: 5, title: 'The Knowledge-Seeking Hoarder', description: 'Accumulates wealth for security and independence through information.' },
  { id: 6, title: 'The Cautious Planner', description: 'Motivated by security and fear of future contingencies.' },
  { id: 7, title: 'The Spontaneous Optimist', description: 'Spends on new experiences and avoids financial constraints.' },
  { id: 8, title: 'The Financial Protector', description: 'Uses wealth to protect themselves and their inner circle.' },
  { id: 9, title: 'The Complacent Avoider', description: 'Avoids financial stress and conflict by ignoring money matters.' },
];
