import React, { useId, useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Small "i" button that explains a metric. Opens on hover, keyboard focus or
// tap (for phones), and closes on Escape or when focus leaves.
export const InfoTip = ({ text, dark = false, className }: { text: React.ReactNode; dark?: boolean; className?: string }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className={cn('relative inline-flex align-middle normal-case tracking-normal', className)}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label="What does this mean?"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        className={cn('inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors',
          dark ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-ink')}
      >
        <Info size={14} />
      </button>
      {open && (
        <span role="tooltip" id={id}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[80vw] rounded-xl bg-ink text-white text-xs font-medium leading-relaxed p-3 shadow-lg text-left whitespace-normal">
          {text}
        </span>
      )}
    </span>
  );
};
