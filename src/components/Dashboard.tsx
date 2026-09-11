import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Plus, Sparkles, PieChart as PieChartIcon, Wallet, TrendingUp, TrendingDown, LayoutGrid } from 'lucide-react';
import { StatCard } from './StatCard';
import { cn, formatCurrency } from '../lib/utils';
import { Transaction, Goal } from '../types';
import { ProgressIndicator } from './ProgressIndicator';
import { BadgesGrid } from './BadgesGrid';

export const Dashboard = ({ transactions, goals, insights, isAiLoading, onAddTransaction, onDeleteTransaction, currency, userProfile }: { 
  transactions: Transaction[], 
  goals: Goal[], 
  insights: string[], 
  isAiLoading: boolean,
  onAddTransaction: () => void,
  onDeleteTransaction: (id: string) => Promise<void>,
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

  const chartData = Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));

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
        <StatCard title="Spending (MTD)" value={totalExpense} icon={PieChartIcon} color="accent" currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProgressIndicator xp={userProfile?.xp || 0} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="text-brand-bg" size={20} />
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
                <h3 className="text-lg font-bold text-slate-900">Spending Analysis</h3>
                <p className="text-sm text-slate-500">A breakdown of your spending by category.</p>
              </div>
              <button 
                onClick={onAddTransaction}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Plus size={14} /> Add Transaction
              </button>
            </div>
            
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value, currency), 'Amount']}
                    />
                    <Bar dataKey="value" fill="#2a4661" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <PieChartIcon size={48} className="mb-2 opacity-20" />
                  <p className="text-sm">No transactions yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Transactions</h3>
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
                <div key={i} className="p-4 bg-brand-bg/5 rounded-xl border border-brand-bg/10">
                  <p className="text-sm text-brand-bg leading-relaxed">{insight}</p>
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
