import React from 'react';
import { motion } from 'motion/react';
import { Plus, Sparkles, PieChart as PieChartIcon, Wallet, TrendingUp, TrendingDown, LayoutGrid } from 'lucide-react';
import { StatCard } from './StatCard';
import { cn, formatCurrency } from '../lib/utils';
import { Transaction, Goal } from '../types';
import { ProgressIndicator } from './ProgressIndicator';
import { BadgesGrid } from './BadgesGrid';

export const Dashboard = ({ transactions, goals, insights, isAiLoading, onAddTransaction, onDeleteTransaction, onViewAllTransactions, currency, userProfile }: { 
  transactions: Transaction[], 
  goals: Goal[], 
  insights: string[], 
  isAiLoading: boolean,
  onAddTransaction: () => void,
  onDeleteTransaction: (id: string) => Promise<void>,
  onViewAllTransactions: () => void,
  currency?: string,
  userProfile: any
}) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netWorth = totalIncome - totalExpense;

  const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Ranked spending: top categories individually, the long tail grouped.
  const ranked = Object.entries(spendingByCategory as Record<string, number>)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const TOP = 8;
  const chartData = ranked.length > TOP + 1
    ? [...ranked.slice(0, TOP), { name: `${ranked.length - TOP} more categories`, value: ranked.slice(TOP).reduce((a, r) => a + r.value, 0) }]
    : ranked;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const spendingMtd = transactions
    .filter(t => t.type === 'expense' && t.date?.startsWith(thisMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  // Sort transactions by date descending
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Net" value={netWorth} icon={Wallet} color="brand" currency={currency} />
        <StatCard title="Total Income" value={totalIncome} icon={TrendingUp} color="emerald" currency={currency} />
        <StatCard title="Total Spending" value={-totalExpense} icon={TrendingDown} color="rose" currency={currency} />
        <StatCard title="Spending (MTD)" value={spendingMtd} icon={PieChartIcon} color="accent" currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProgressIndicator xp={userProfile?.xp || 0} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="text-ink" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Achievements Unlocked</h3>
          </div>
          <BadgesGrid unlockedBadgeIds={userProfile?.badges || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Spending by category</h3>
                <p className="text-sm text-slate-500">Where your money goes, largest first.</p>
              </div>
              <button 
                onClick={onAddTransaction}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Plus size={14} /> Add Transaction
              </button>
            </div>
            
            <div>
              {chartData.length > 0 ? (
                <ul className="space-y-3">
                  {chartData.map(row => {
                    const pct = totalExpense ? (row.value / totalExpense) * 100 : 0;
                    return (
                      <li key={row.name}>
                        <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
                          <span className="font-medium text-ink truncate">{row.name}</span>
                          <span className="whitespace-nowrap tabular-nums">
                            <span className="font-semibold text-ink">{formatCurrency(row.value, currency)}</span>
                            <span className="text-slate-500 ml-2 inline-block w-11 text-right">{pct.toFixed(pct < 10 ? 1 : 0)}%</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(pct, 1)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <PieChartIcon size={48} className="mb-2 opacity-20" />
                  <p className="text-sm">No transactions yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
              {transactions.length > 0 && (
                <button onClick={onViewAllTransactions} className="text-sm font-semibold text-focus hover:text-blue-700">
                  View all & edit ({transactions.length}) →
                </button>
              )}
            </div>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}>
                        {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{t.category}</p>
                        <p className="text-xs text-slate-500">{t.date} • {t.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={cn(
                        "text-sm font-bold",
                        t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {formatCurrency(t.amount, currency)}
                      </p>
                      <button 
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">No recent transactions.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-brand-accent" size={20} />
            <h3 className="text-lg font-bold text-slate-900">AI Insights</h3>
          </div>
          <div className="space-y-4">
            {isAiLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, i) => (
                <div key={i} className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-sm text-ink leading-relaxed">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">Add more data to get personalized insights.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
