import React from 'react';
import { cn } from '../lib/utils';

// Circular progress gauge. The SVG owns the whole box (no CSS border), so the
// track and the arc share one coordinate system and line up exactly.
export const RingGauge = ({ value, size = 128, stroke = 10, className, label }: {
  value: number;           // 0–1; values above 1 show a full ring
  size?: number;
  stroke?: number;
  className?: string;      // text colour of the arc, e.g. "text-primary"
  label: React.ReactNode;
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-100" />
        {v > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
            stroke="currentColor" strokeDasharray={c} strokeDashoffset={c * (1 - v)}
            className={cn('transition-[stroke-dashoffset] duration-700 ease-out', className)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{label}</div>
    </div>
  );
};
