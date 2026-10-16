import React, { useState } from 'react';
import { Modal } from './Modal';
import { Goal } from '../types';
import { Target, Plus, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdate?: (id: string, goal: Partial<Goal>) => Promise<void>;
  goal?: Goal;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onAdd, onUpdate, goal }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<'1-year' | '3-year' | '5-year'>('1-year');
  const [obstacles, setObstacles] = useState('');
  const [partners, setPartners] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [plan, setPlan] = useState('');
  const [why, setWhy] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(goal.targetAmount.toString());
      setCurrentAmount(goal.currentAmount.toString());
      setDeadline(goal.deadline);
      setCategory(goal.category);
      setObstacles(goal.obstacles || '');
      setPartners(goal.partners || '');
      setKnowledge(goal.knowledge || '');
      setPlan(goal.plan || '');
      setWhy(goal.why || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setCategory('1-year');
      setObstacles('');
      setPartners('');
      setKnowledge('');
      setPlan('');
      setWhy('');
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    setLoading(true);
    try {
      const goalData = {
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount),
        deadline,
        category,
        obstacles,
        partners,
        knowledge,
        plan,
        why,
      };

      if (goal && onUpdate) {
        await onUpdate(goal.id, goalData);
      } else {
        await onAdd(goalData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? "Update Financial Goal" : "Set Financial Goal"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          {(['1-year', '3-year', '5-year'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                category === cat ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Fund, House Down Payment"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Saved</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</label>
              <span className="text-xs font-bold text-ink">
                {targetAmount && parseFloat(targetAmount) > 0 
                  ? Math.round((parseFloat(currentAmount || '0') / parseFloat(targetAmount)) * 100) 
                  : 0}% Complete
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={targetAmount && parseFloat(targetAmount) > 0 
                ? Math.round((parseFloat(currentAmount || '0') / parseFloat(targetAmount)) * 100) 
                : 0}
              onChange={(e) => {
                const pct = parseInt(e.target.value);
                const target = parseFloat(targetAmount || '0');
                if (target > 0) {
                  setCurrentAmount((target * (pct / 100)).toFixed(0));
                }
              }}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Deadline</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-accent" />
              Zig Ziglar's 7-Step Planning
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">1. Why do you want this?</label>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="The emotional motivation behind this goal..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">2. List the obstacles</label>
                <textarea
                  value={obstacles}
                  onChange={(e) => setObstacles(e.target.value)}
                  placeholder="What will stand in your way?"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">3. Identify people & groups</label>
                <textarea
                  value={partners}
                  onChange={(e) => setPartners(e.target.value)}
                  placeholder="Who can help you achieve this?"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">4. Identify what you need to know</label>
                <textarea
                  value={knowledge}
                  onChange={(e) => setKnowledge(e.target.value)}
                  placeholder="Skills or knowledge required..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">5. Plan of action</label>
                <textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="The specific steps you will take..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all h-24 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {loading ? (goal ? "Updating Goal..." : "Setting Goal...") : <><Target size={20} /> {goal ? "Update Goal" : "Set Goal"}</>}
        </button>
      </form>
    </Modal>
  );
};
