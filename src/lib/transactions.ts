import type { Transaction } from '../types';

// Groups bank descriptions that differ only by reference numbers or punctuation,
// e.g. "UBER *TRIP 1234" and "Uber Trip 9876" both become "uber trip".
export const merchantKey = (description = '') =>
  description.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

type Comparable = Pick<Transaction, 'date' | 'amount' | 'type' | 'description'>;

// Same date, same amount to the cent, same type and same merchant.
const duplicateKey = (t: Comparable) =>
  [String(t.date).slice(0, 10), Math.round(Math.abs(Number(t.amount) || 0) * 100), t.type, merchantKey(t.description)].join('|');

export type DuplicateReason = 'existing' | 'file';

// For each incoming row, says whether it looks like a transaction already
// saved, or a repeat of an earlier row in the same import. The first copy of a
// row within the file is not flagged, so one copy can still be saved.
export function findDuplicates(incoming: Comparable[], existing: Comparable[]): (DuplicateReason | null)[] {
  const saved = new Set(existing.map(duplicateKey));
  const seen = new Set<string>();
  return incoming.map(t => {
    const key = duplicateKey(t);
    if (saved.has(key)) return 'existing';
    if (seen.has(key)) return 'file';
    seen.add(key);
    return null;
  });
}
