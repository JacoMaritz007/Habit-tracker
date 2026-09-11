import React from 'react';
import { Trophy, Star, ShieldCheck, Zap } from 'lucide-react';
import { calculateLevel, getLevelProgress, getRankTitle, getXPForLevel } from '../lib/progress';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ProgressIndicatorProps {
  xp: number;
  compact?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ xp, compact = false }) => {
  const level = calculateLevel(xp);
  const progress = getLevelProgress(xp);
  const rank = getRankTitle(level);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const levelXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-brand-bg/10 flex items-center justify-center border-2 border-brand-bg/20">
            <span className="text-sm font-black text-brand-bg">{level}</span>
          </div>
          <svg className="absolute inset-0 w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              className="text-slate-100"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={113}
              initial={{ strokeDashoffset: 113 }}
              animate={{ strokeDashoffset: 113 - (progress * 113) }}
              className="text-brand-bg"
            />
          </svg>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] font-black text-brand-bg uppercase tracking-widest">{rank}</p>
          <p className="text-[10px] text-slate-400 font-bold">{xp} Total XP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-bg pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
        <Trophy size={120} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-bg/10 flex items-center justify-center border-2 border-brand-bg/20 shadow-inner">
            <Zap size={24} className="text-brand-bg fill-brand-bg/20" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Level {level}</h3>
            <p className="text-lg font-bold text-slate-900">{rank}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-brand-accent">
            <Star size={14} className="fill-brand-accent" />
            <span className="text-sm font-black tracking-tight">{xp} XP</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Progress</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            className="h-full bg-gradient-to-r from-brand-bg to-brand-accent relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-shimmer"></div>
          </motion.div>
        </div>
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>{levelXP} / {neededXP} XP to Level {level + 1}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Identity Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Season 1 Active</span>
        </div>
      </div>
    </div>
  );
};
