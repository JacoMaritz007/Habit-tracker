import React, { useState } from 'react';
import { Sparkles, MessageSquare, RefreshCw, Plus, CheckCircle2, Target, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface SuggestedHabit {
  title: string;
  description: string;
  pillar: string;
}

interface CoachResponse {
  message: string;
  habits: SuggestedHabit[];
  suggestedGoal?: {
    title: string;
    targetAmount: number;
    deadline: string;
    category: string;
    obstacles?: string;
    partners?: string;
    knowledge?: string;
    plan?: string;
    why?: string;
  };
}

export const AiCoachSection = ({ title, placeholder, onSuggest, onAddHabit, onAddGoal }: {
  title: string;
  placeholder: string;
  onSuggest: (msg: string) => Promise<CoachResponse>;
  onAddHabit?: (habit: { title: string; description: string }) => void;
  onAddGoal?: (goal: { title: string; targetAmount: number; deadline: string; category: string; obstacles?: string; partners?: string; knowledge?: string; plan?: string; why?: string }) => void;
}) => {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [addedHabits, setAddedHabits] = useState<string[]>([]);
  const [goalAdded, setGoalAdded] = useState(false);

  const handleSubmit = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    try {
      const res = await onSuggest(msg);
      setResponse(res);
      setMsg('');
      setAddedHabits([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (habit: SuggestedHabit) => {
    if (onAddHabit) {
      onAddHabit({ title: habit.title, description: habit.description });
      setAddedHabits([...addedHabits, habit.title]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-bg shadow-sm border border-slate-100">
            <Sparkles size={20} className="text-brand-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[10px] text-slate-500">Your AI-powered wealth companion.</p>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full my-4" />
        
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          <div className="p-4 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-brand-bg rounded flex items-center justify-center text-[10px] text-white font-bold shadow-sm">W</div>
              <span className="text-xs font-bold text-slate-900">Wealth Coach</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {response?.message || "Ask me anything about your wealth habits or financial personality. I'll use proven frameworks like Atomic Habits and Zig Ziglar's Goal Setting to help you build lasting wealth."}
            </p>
            
            {response?.suggestedGoal && onAddGoal && (
              <div className="mt-4 p-4 bg-brand-bg/5 border border-brand-bg/20 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-brand-bg uppercase tracking-[0.2em]">Suggested Goal</span>
                  <button 
                    onClick={() => {
                      onAddGoal(response.suggestedGoal!);
                      setGoalAdded(true);
                    }}
                    disabled={goalAdded}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm",
                      goalAdded 
                        ? "bg-emerald-100 text-emerald-600" 
                        : "bg-brand-bg text-white hover:bg-brand-bg/90"
                    )}
                  >
                    {goalAdded ? <><CheckCircle2 size={12} /> Added</> : <><Plus size={12} /> Add to Plan</>}
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{response.suggestedGoal.title}</h4>
                <div className="flex gap-3 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Target size={10} /> ${response.suggestedGoal.targetAmount.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {response.suggestedGoal.deadline}</span>
                </div>
              </div>
            )}
          </div>
          
          {response?.habits && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Recommended Habits</p>
              {response.habits.map((habit, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                      habit.pillar.includes('Obvious') ? "bg-blue-50 text-blue-600 border border-blue-100" :
                      habit.pillar.includes('Attractive') ? "bg-pink-50 text-pink-600 border border-pink-100" :
                      habit.pillar.includes('Easy') ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      habit.pillar.includes('Satisfying') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      habit.pillar.includes('Step') ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                      "bg-slate-50 text-slate-600 border border-slate-100"
                    )}>
                      {habit.pillar}
                    </span>
                    <button 
                      onClick={() => handleAdd(habit)}
                      disabled={addedHabits.includes(habit.title)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all shadow-sm",
                        addedHabits.includes(habit.title) 
                          ? "bg-emerald-100 text-emerald-600" 
                          : "bg-brand-bg/5 text-brand-bg hover:bg-brand-bg hover:text-white"
                      )}
                    >
                      {addedHabits.includes(habit.title) ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">{habit.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{habit.description}</p>
                </div>
              ))}
            </div>
          )}

          {!response && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {['How to start saving?', 'Help me spend less', 'Build an emergency fund', 'Investing for beginners'].map(q => (
                  <button 
                    key={q} 
                    onClick={() => setMsg(q)} 
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-600 hover:border-brand-bg/40 hover:text-brand-bg hover:bg-brand-bg/5 transition-all shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {response && (
            <button 
              onClick={() => setResponse(null)}
              className="text-[10px] font-bold text-brand-bg hover:underline flex items-center gap-1 px-1"
            >
              <RefreshCw size={10} /> Ask another question
            </button>
          )}
        </div>

        <div className="relative mt-auto">
          <textarea 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={placeholder}
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-bg/20 focus:border-brand-bg/30 outline-none resize-none transition-all shadow-inner pr-12"
          />
          <button 
            onClick={handleSubmit}
            disabled={loading || !msg.trim()}
            className="absolute bottom-3 right-3 p-2 bg-brand-bg text-white rounded-lg hover:bg-brand-bg/90 transition-all disabled:opacity-50 shadow-lg shadow-brand-bg/20"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <MessageSquare size={16} />}
          </button>
        </div>
        <p className="mt-2 text-[9px] text-center text-slate-400 font-medium">Press Enter to send</p>
      </div>
    </div>
  );
};
