import React from 'react';
import { motion } from 'motion/react';
import { Target, Sparkles, Plus, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Goal } from '../types';
import { AiCoachSection } from './AiCoachSection';

export const Goals = ({ goals, onAddGoal, onEditGoal, onAddGoalDirect, onDeleteGoal, onSuggestGoals, currency }: { 
  goals: Goal[],
  onAddGoal: () => void,
  onEditGoal: (goal: Goal) => void,
  onAddGoalDirect: (goal: { title: string; targetAmount: number; deadline: string; category: string; obstacles?: string; partners?: string; knowledge?: string; plan?: string; why?: string }) => void,
  onDeleteGoal: (id: string) => Promise<void>,
  onSuggestGoals: (msg: string) => Promise<any>,
  currency?: string
}) => {
  const [activePlan, setActivePlan] = React.useState('1-year');
  const [expandedGoal, setExpandedGoal] = React.useState<string | null>(null);

  const filteredGoals = goals.filter(g => g.category === activePlan);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-ink rounded-lg"><Target size={20} /></div>
            <h3 className="text-lg font-bold text-slate-900">Why Set Financial Goals?</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Without goals, money drifts. Spending fills whatever space is available, and savings become an afterthought. 
              A written financial goal shifts your relationship with money from reactive to intentional.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Research consistently shows that people who write down specific goals are significantly more likely to achieve them. 
              Goals create a filter — every financial decision becomes easier when you can ask: "Does this take me closer to or further from what I actually want?"
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Goals also build identity. When you commit to saving for a house deposit or an emergency fund, you start making decisions from the perspective of someone who is building wealth — not just managing expenses.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-accent/10 text-brand-accent rounded-lg"><Sparkles size={20} /></div>
            <h3 className="text-lg font-bold text-slate-900">How to Think About Goals</h3>
          </div>
          <ul className="text-sm text-slate-600 space-y-4">
            <li>
              <strong>Make them specific and timed.</strong> "Save more money" is a wish. "Save $15,000 for a house deposit in 3 years" is a goal. A number and a deadline turns intention into a plan.
            </li>
            <li>
              <strong>Layer your timeframes.</strong> Short-term goals (1 year) build momentum. Medium-term goals (3 years) require strategy. Long-term goals (5+ years) require identity shifts. You need all three working together.
            </li>
            <li>
              <strong>Connect them to your life, not just your bank balance.</strong> The best goals are emotionally charged — they represent freedom, security, opportunity, or joy. If you can't feel why a goal matters, you won't stay committed when it gets hard.
            </li>
            <li>
              <strong>Review and adjust.</strong> Goals aren't set in stone. Life changes — income, priorities, and circumstances all shift. Revisit your goals regularly and treat updates as growth, not failure.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {[
            { id: '1-year', label: '1 Year Plan' },
            { id: '3-year', label: '3 Year Plan' },
            { id: '5-year', label: '5 Year Plan' }
          ].map(plan => (
            <button 
              key={plan.id} 
              onClick={() => setActivePlan(plan.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                activePlan === plan.id ? "bg-primary text-white" : "text-slate-600 hover:text-primary-ink hover:bg-slate-50"
              )}
            >
              {plan.label}
            </button>
          ))}
        </div>
        <button 
          onClick={onAddGoal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredGoals.length > 0 ? (
            filteredGoals.map(goal => (
              <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-slate-900">{goal.title}</h4>
                  <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
                    Due {goal.deadline}
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium mb-6">
                  <span className="text-slate-400">{formatCurrency(goal.currentAmount, currency)}</span>
                  <span className="text-slate-400">{formatCurrency(goal.targetAmount, currency)}</span>
                  <span className="text-ink font-bold">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEditGoal(goal)}
                    className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                    className={cn(
                      "px-3 py-2 border rounded-lg text-xs font-bold transition-colors",
                      expandedGoal === goal.id ? "bg-primary text-white border-primary" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {expandedGoal === goal.id ? "Hide Plan" : "View Plan"}
                  </button>
                  <button 
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 border border-rose-100 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {expandedGoal === goal.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-slate-100 space-y-4"
                  >
                    {goal.why && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">The Motivation (Why)</h5>
                        <p className="text-xs text-slate-600 italic">"{goal.why}"</p>
                      </div>
                    )}
                    {goal.obstacles && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Obstacles</h5>
                        <p className="text-xs text-slate-600">{goal.obstacles}</p>
                      </div>
                    )}
                    {goal.partners && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Partners/Groups</h5>
                        <p className="text-xs text-slate-600">{goal.partners}</p>
                      </div>
                    )}
                    {goal.knowledge && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Required Knowledge</h5>
                        <p className="text-xs text-slate-600">{goal.knowledge}</p>
                      </div>
                    )}
                    {goal.plan && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan of Action</h5>
                        <p className="text-xs text-slate-600 whitespace-pre-line">{goal.plan}</p>
                      </div>
                    )}
                    {!goal.why && !goal.obstacles && !goal.plan && (
                      <p className="text-xs text-slate-400 italic">No plan details recorded for this goal.</p>
                    )}
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Target size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium">No goals set for this timeframe yet.</p>
              <button 
                onClick={onAddGoal}
                className="mt-4 text-ink font-bold text-sm hover:underline"
              >
                Set your first {activePlan.replace('-', ' ')} goal
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <AiCoachSection 
            title="Zig Ziglar Goal Brainstormer" 
            placeholder="What's a big dream you have? I'll help you turn it into a Ziglar-style structured goal..."
            onSuggest={onSuggestGoals}
            onAddGoal={onAddGoalDirect}
          />
        </div>
      </div>
    </motion.div>
  );
};
