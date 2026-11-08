import React from 'react';
import { cn } from '../lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, groupsFor } from '../lib/categories';

// Grouped category dropdown. A value outside the shared list (an older or
// custom category) is kept as its own option so it isn't silently changed.
export const CategorySelect = ({ type, value, onChange, className, ariaLabel }: {
  type: 'income' | 'expense';
  value: string;
  onChange: (category: string) => void;
  className?: string;
  ariaLabel?: string;
}) => {
  const known = (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).includes(value);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={ariaLabel || 'Category'}
      className={cn('wh-select !h-9 !text-sm !pl-3', className)}
    >
      {!known && value && <option value={value}>{value}</option>}
      {groupsFor(type).map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </optgroup>
      ))}
    </select>
  );
};
