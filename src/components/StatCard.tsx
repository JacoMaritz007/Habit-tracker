import React from 'react';
import { cn, formatCurrency } from '../lib/utils';

export const StatCard = ({ title, value, icon: Icon, color, currency }: any) => {
  const colors: any = {
    brand: "bg-primary/5 text-ink border-primary/10",
    accent: "bg-brand-accent/5 text-brand-accent border-brand-accent/10",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-xl border", colors[color])}>
          <Icon size={20} />
        </div>
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
      </div>
      <p className={cn(
        "text-2xl font-bold",
        value >= 0 ? "text-slate-900" : "text-rose-600"
      )}>
        {formatCurrency(value, currency)}
      </p>
    </div>
  );
};
