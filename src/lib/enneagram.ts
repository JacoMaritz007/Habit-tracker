// The Wealth Enneagram type is stored on the profile as a number 1–9.
// Older profiles may hold text such as "Type 3: The Achiever" or "3";
// parseEnneagramType reads all of these.

export const ENNEAGRAM_NAMES: Record<number, string> = {
  1: 'The Principled Saver',
  2: 'The Generous Helper',
  3: 'The Goal Achiever',
  4: 'The Creative Individualist',
  5: 'The Analytical Investigator',
  6: 'The Cautious Loyalist',
  7: 'The Visionary Enthusiast',
  8: 'The Decisive Challenger',
  9: 'The Steady Peacemaker',
};

export function parseEnneagramType(value: unknown): number | null {
  if (typeof value === 'number') return value >= 1 && value <= 9 ? value : null;
  if (typeof value !== 'string') return null;
  const match = value.match(/\b([1-9])\b/);
  return match ? Number(match[1]) : null;
}

export const enneagramLabel = (value: unknown) => {
  const n = parseEnneagramType(value);
  return n ? `Type ${n}: ${ENNEAGRAM_NAMES[n]}` : null;
};
