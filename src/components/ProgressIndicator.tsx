import React, { useState } from 'react';
import { Trophy, Star, ShieldCheck, Zap, ChevronDown } from 'lucide-react';
import { calculateLevel, getLevelProgress, getRankTitle, getXPForLevel, getNextRank, RANKS } from '../lib/progress';
import { XP_REWARDS } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ProgressIndicatorProps {
  xp: number;
  compact?: boolean;
}

// How members earn XP, in the order they usually do these things.
const EARN_XP: [string, number][] = [
  ['Complete a daily habit', XP_REWARDS.HABIT_COMPLETE],
  ['Create a new habit', XP_REWARDS.HABIT_CREATE],
  ['Log a transaction (each one)', XP_REWARDS.TRANSACTION_LOG],
  ['Set a goal', XP_REWARDS.GOAL_SET],
  ['Reach a goal', XP_REWARDS.GOAL_COMPLETE],
  ['Save your Freedom Calculator (first time)', XP_REWARDS.FREEDOM_CALC_SAVE],
  ['Choose your Wealth Enneagram type (first time)', XP_REWARDS.ENNEAGRAM_TYPE],
  ['Answer a Money Story question', XP_REWARDS.MONEY_STORY_ANSWER],
  ['Write a gratitude entry', XP_REWARDS.GRATITUDE_ENTRY],
  ['Log a wealth ritual', XP_REWARDS.RITUAL_LOG],
  ['Get your profile photo analysed (first time)', XP_REWARDS.PHOTO_ANALYSIS],
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ xp, compact = false }) => {
  const [showLegend, setShowLegend] = useState(false);
  const level = calculateLevel(xp);
  const progress = getLevelProgress(xp);
  const rank = getRankTitle(level);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const levelXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const nextRank = getNextRank(level);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <span className="text-sm font-black text-ink">{level}</span>
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
              className="text-ink"
            />
          </svg>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] font-black text-ink uppercase tracking-widest">{rank}</p>
          <p className="text-[10px] text-slate-400 font-bold">{xp} Total XP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-ink pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
        <Trophy size={120} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
            <Zap size={24} className="text-ink fill-primary/20" />
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
            className="h-full bg-emerald-500 relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-shimmer"></div>
          </motion.div>
        </div>
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>{levelXP} / {neededXP} XP to Level {level + 1}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          <span className="font-semibold text-ink">{(nextLevelXP - xp).toLocaleString()} XP</span> to Level {level + 1} (at {nextLevelXP.toLocaleString()} XP).
          {nextRank && <> Next rank: <span className="font-semibold text-ink">{nextRank.title}</span> at Level {nextRank.fromLevel} ({getXPForLevel(nextRank.fromLevel).toLocaleString()} XP).</>}
        </p>
        <button
          type="button"
          onClick={() => setShowLegend(v => !v)}
          aria-expanded={showLegend}
          className="flex items-center gap-1 text-xs font-semibold text-focus hover:text-blue-700"
        >
          How levels work <ChevronDown size={14} className={cn('transition-transform', showLegend && 'rotate-180')} />
        </button>
      </div>

      {showLegend && (
        <div className="mt-4 space-y-5 relative z-10">
          <p className="text-xs text-slate-600 leading-relaxed">
            You earn XP for the wealth habits you build in the app. Your total XP sets your level, and each level needs more XP than the last:
            {' '}reaching Level <i>N</i> takes (<i>N</i> − 1)² × 100 XP, so Level 2 is at 100 XP, Level 3 at 400 and Level 4 at 900. Every few levels you earn a new rank.
          </p>

          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ranks</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="wh-table">
                <thead>
                  <tr><th>Rank</th><th>Levels</th><th className="is-num">From</th></tr>
                </thead>
                <tbody>
                  {RANKS.map((r, i) => {
                    const toLevel = RANKS[i + 1] ? RANKS[i + 1].fromLevel - 1 : null;
                    const current = r.title === rank;
                    return (
                      <tr key={r.title} className={cn(current && 'bg-primary-soft/60')}>
                        <td>
                          <p className="font-semibold text-ink">{r.title}{current && <span className="wh-chip wh-chip--orange !h-5 !text-[10px] ml-2">You</span>}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.meaning}</p>
                        </td>
                        <td className="whitespace-nowrap text-slate-600">{toLevel ? `${r.fromLevel}–${toLevel}` : `${r.fromLevel}+`}</td>
                        <td className="is-num whitespace-nowrap font-semibold">{getXPForLevel(r.fromLevel).toLocaleString()} XP</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">How to earn XP</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {EARN_XP.map(([label, points]) => (
                <li key={label} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-ink tabular-nums whitespace-nowrap">+{points} XP</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
