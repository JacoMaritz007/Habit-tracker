import React from 'react';
import { PROGRESS_BADGES } from '../types';
import { 
  Zap, 
  Flame, 
  Target, 
  Map as MapIcon, 
  BookOpen, 
  Sun, 
  User, 
  FileText,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BadgesGridProps {
  unlockedBadgeIds: string[];
}

const ICON_MAP: Record<string, any> = {
  zap: Zap,
  flame: Flame,
  target: Target,
  map: MapIcon,
  'book-open': BookOpen,
  sun: Sun,
  user: User,
  'file-text': FileText,
};

export const BadgesGrid: React.FC<BadgesGridProps> = ({ unlockedBadgeIds }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {PROGRESS_BADGES.map((badge) => {
        const isUnlocked = unlockedBadgeIds.includes(badge.id);
        const Icon = ICON_MAP[badge.icon] || Zap;

        return (
          <div 
            key={badge.id}
            className={cn(
              "relative p-4 rounded-3xl border transition-all duration-500 flex flex-col items-center text-center",
              isUnlocked 
                ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1" 
                : "bg-slate-50 border-slate-100 opacity-60 grayscale"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500",
              isUnlocked ? "bg-primary/10 text-ink rotate-0" : "bg-slate-200 text-slate-400 rotate-12"
            )}>
              {isUnlocked ? <Icon size={24} /> : <Lock size={20} />}
            </div>
            
            <h4 className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-1",
              isUnlocked ? "text-slate-900" : "text-slate-400"
            )}>
              {badge.title}
            </h4>
            <p className="text-[9px] text-slate-500 leading-tight font-medium max-w-[80px]">
              {badge.description}
            </p>

            {isUnlocked && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent rounded-full border-2 border-white flex items-center justify-center shadow-sm"
              >
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
