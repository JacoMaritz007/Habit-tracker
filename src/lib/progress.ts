import { XP_REWARDS, PROGRESS_BADGES, Badge } from '../types';
import { parseEnneagramType } from './enneagram';

/**
 * Calculates level based on XP using a progressive formula
 * level = floor(sqrt(xp / 100)) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculates XP required for a specific level
 * xp = ((level - 1) ^ 2) * 100
 */
export function getXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Gets progress within the current level (0 to 1)
 */
export function getLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  
  if (nextLevelXP === currentLevelXP) return 0;
  return Math.min(1, Math.max(0, (xp - currentLevelXP) / (nextLevelXP - currentLevelXP)));
}

/**
 * Ranks: a new title every few levels. Used by getRankTitle and the levels
 * legend, so the two can never disagree.
 */
export const RANKS = [
  { title: 'Wealth Novice', fromLevel: 1, meaning: 'Getting started: tracking money, setting first habits and goals.' },
  { title: 'Financial Apprentice', fromLevel: 5, meaning: 'Building routine: habits done most days, spending understood.' },
  { title: 'Money Manager', fromLevel: 10, meaning: 'In control: a budget you follow, goals funded every month.' },
  { title: 'Wealth Builder', fromLevel: 20, meaning: 'Growing assets: consistent investing and a clear freedom plan.' },
  { title: 'Prosperity Pro', fromLevel: 35, meaning: 'Momentum: long streaks, goals reached, mindset work done.' },
  { title: 'Financial Strategist', fromLevel: 50, meaning: 'Thinking long term: optimising your plan and reviewing it on rhythm.' },
  { title: 'Abundance Master', fromLevel: 75, meaning: 'Living the habits: wealth-building is second nature.' },
  { title: 'Wealth Legend', fromLevel: 100, meaning: 'The top rank: years of consistent wealth habits.' },
] as const;

export function getRankTitle(level: number): string {
  return [...RANKS].reverse().find(r => level >= r.fromLevel)!.title;
}

/** The rank after the given level's rank, or null at the top. */
export function getNextRank(level: number) {
  return RANKS.find(r => r.fromLevel > level) ?? null;
}

/**
 * Check for new badges based on user state
 */
export function checkForNewBadges(userProfile: any, context: { 
  habits: any[], 
  transactions: any[], 
  goals: any[],
  moneyStoryResponses: any[],
  gratitudeEntries: any[]
}): string[] {
  const newBadges: string[] = [];
  const existingBadges = userProfile.badges || [];
  
  const check = (id: string, condition: boolean) => {
    if (condition && !existingBadges.includes(id)) {
      newBadges.push(id);
    }
  };

  // Badge: first_habit
  check('first_habit', context.habits.some(h => h.completedDays.length > 0));

  // Badge: habit_streak_7
  check('habit_streak_7', context.habits.some(h => h.streak >= 7));

  // Badge: first_goal
  check('first_goal', context.goals.length > 0);

  // Badge: story_revealed
  check('story_revealed', context.moneyStoryResponses.length > 0);

  // Badge: gratitude_pioneer
  check('gratitude_pioneer', context.gratitudeEntries.length > 0);

  // Badge: wealth_enneagram
  check('wealth_enneagram', parseEnneagramType(userProfile.enneagramType) !== null);

  // Badge: transaction_master
  check('transaction_master', context.transactions.length >= 50);

  return newBadges;
}
