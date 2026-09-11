import { XP_REWARDS, PROGRESS_BADGES, Badge } from '../types';

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
 * Rank titles based on levels
 */
export function getRankTitle(level: number): string {
  if (level < 5) return 'Wealth Novice';
  if (level < 10) return 'Financial Apprentice';
  if (level < 20) return 'Money Manager';
  if (level < 35) return 'Wealth Builder';
  if (level < 50) return 'Prosperity Pro';
  if (level < 75) return 'Financial Strategist';
  if (level < 100) return 'Abundance Master';
  return 'Wealth Legend';
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
  check('wealth_enneagram', !!userProfile.enneagramType && userProfile.enneagramType !== 'Select your type');

  // Badge: transaction_master
  check('transaction_master', context.transactions.length >= 50);

  return newBadges;
}
