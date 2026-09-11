import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, Bell, Plus } from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { cn } from '../lib/utils';
import { Habit } from '../types';
import { AiCoachSection } from './AiCoachSection';

const InfoCard = ({ title, description, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
    <div className={cn("p-2 rounded-lg", color === 'brand' ? "bg-brand-bg/10 text-brand-bg" : color === 'accent' ? "bg-brand-accent/10 text-brand-accent" : "bg-slate-100 text-slate-600")}>
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

export const Habits = ({ habits, toggleHabit, onSuggestHabits, onAddHabit, onAddHabitDirect, onDeleteHabit }: { 
  habits: Habit[], 
  toggleHabit: (id: string) => void,
  onSuggestHabits: (msg: string) => Promise<any>,
  onAddHabit: () => void,
  onAddHabitDirect: (habit: { title: string; description: string }) => void,
  onDeleteHabit: (id: string) => Promise<void>
}) => {
  const today = format(startOfToday(), 'yyyy-MM-dd');
  const completedToday = habits.filter(h => h.completedDays.includes(today)).length;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard 
          title="Daily consistency wins" 
          description="Small actions repeated daily compound into major wealth-building results. Even one habit done consistently beats a perfect plan done inconsistently." 
          icon={CheckCircle2} 
          color="brand" 
        />
        <InfoCard 
          title="Build your streak" 
          description="Check off every habit today to keep your streak alive. Missing one day is human — missing two is a new habit forming in the wrong direction." 
          icon={TrendingUp} 
          color="accent" 
        />
        <InfoCard 
          title="How it works" 
          description="Add financial habits to your daily checklist. Use the AI coach to get personalised habit ideas based on your goals and challenges, then add them with one click." 
          icon={Bell} 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Daily Habits</h3>
              <p className="text-sm text-slate-500">{completedToday} of {habits.length} completed today</p>
            </div>
            <button 
              onClick={onAddHabit}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Plus size={14} /> Add Habit
            </button>
          </div>

          <div className="space-y-4">
            {habits.map(habit => (
              <div 
                key={habit.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 group",
                  habit.completedDays.includes(today)
                    ? "bg-brand-bg/5 border-brand-bg/20"
                    : "bg-white border-slate-200 hover:border-brand-bg/30"
                )}
              >
                <div 
                  className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer",
                    habit.completedDays.includes(today)
                      ? "bg-brand-bg border-brand-bg"
                      : "border-slate-300"
                  )}
                  onClick={() => toggleHabit(habit.id)}
                >
                  {habit.completedDays.includes(today) && <Plus size={14} className="text-white rotate-45" />}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => toggleHabit(habit.id)}>
                  <h4 className={cn("font-bold text-sm mb-1", habit.completedDays.includes(today) ? "text-brand-bg" : "text-slate-900")}>
                    {habit.title}
                  </h4>
                  <p className="text-xs text-slate-500">{habit.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-[10px] font-bold">
                      <TrendingUp size={10} /> {habit.streak}d
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHabit(habit.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Plus size={14} className="rotate-45" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AiCoachSection 
          title="AI Habit Coach" 
          placeholder="Tell me about your money situation, goals, or struggles — I'll suggest habits tailored to you..."
          onSuggest={onSuggestHabits}
          onAddHabit={onAddHabitDirect}
        />
      </div>
    </motion.div>
  );
};
