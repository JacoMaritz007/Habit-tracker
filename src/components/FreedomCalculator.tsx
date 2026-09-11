import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  PieChart, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Info, 
  DollarSign, 
  Briefcase, 
  Home, 
  CreditCard, 
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Save,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FreedomCalculatorData, FreedomGoal } from '../types';
import { cn } from '../lib/utils';

interface FreedomCalculatorProps {
  data: FreedomCalculatorData | null;
  onSave: (data: Partial<FreedomCalculatorData>) => Promise<void>;
  globalCurrency?: string;
}

const STEPS = [
  { id: 'start', title: 'Start Here', icon: Info },
  { id: 'step1', title: 'Net Worth', icon: Briefcase },
  { id: 'step2', title: 'Freedom Number', icon: Target },
  { id: 'step3', title: 'Wealth Plan', icon: TrendingUp },
  { id: 'step4', title: 'Dashboard', icon: PieChart },
  { id: 'step5', title: 'Wealth Rhythm', icon: CheckCircle2 },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const EXPENSE_BUFFERS = [
  { label: '0%', value: 0 },
  { label: '10%', value: 0.1 },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1.0 },
];

export const FreedomCalculator: React.FC<FreedomCalculatorProps> = ({ data, onSave, globalCurrency }) => {
  const [activeStep, setActiveStep] = useState('start');
  const [localData, setLocalData] = useState<Partial<FreedomCalculatorData>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setLocalData(data);
    } else {
      // Initial default state
      setLocalData({
        currency: globalCurrency || 'USD',
        monthlyEarnedIncome: 0,
        monthlyPassiveIncome: 0,
        monthlyExpenses: 0,
        expenseBuffer: 0.1,
        assets: {
          bank: 0,
          stocks: 0,
          crypto: 0,
          retirement: 0,
          realEstate: 0,
          business: 0,
          alternative: 0,
        },
        liabilities: {
          schoolLoans: 0,
          creditCards: 0,
          retailDebt: 0,
          bankLoans: 0,
          mortgages: 0,
        },
        inflationRate: 0.06,
        withdrawalRate: 0.04,
        freedomGoals: [],
        startingCapital: 0,
        monthlyInvestment: 0,
        annualIncrease: 0.05,
        targetIrr: 0.12,
        timelineYears: 20,
        rhythmStatus: {
          monthly: false,
          quarterly: false,
          annually: false,
          daily: false,
          weekly: false
        }
      });
    }
  }, [data, globalCurrency]);

  const handleSave = async (dataToSave?: Partial<FreedomCalculatorData>) => {
    setIsSaving(true);
    try {
      await onSave(dataToSave || localData);
    } finally {
      setIsSaving(false);
    }
  };

  const goToStep = async (stepId: string) => {
    await handleSave();
    setActiveStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    setLocalData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      // Handle numeric inputs that might be empty
      const finalValue = (typeof value === 'number' && isNaN(value)) ? 0 : value;
      current[keys[keys.length - 1]] = finalValue;
      return newData;
    });
  };

  const currentCurrency = localData.currency || globalCurrency || 'USD';
  const currencySymbol = CURRENCIES.find(c => c.code === currentCurrency)?.symbol || '$';

  // Calculations
  const totalMonthlyIncome = (localData.monthlyEarnedIncome || 0) + (localData.monthlyPassiveIncome || 0);
  const baseMonthlyExpenses = localData.monthlyExpensesOverride !== undefined ? localData.monthlyExpensesOverride : (localData.monthlyExpenses || 0);
  const bufferedExpenses = baseMonthlyExpenses * (1 + (localData.expenseBuffer || 0));
  const savingsRate = totalMonthlyIncome > 0 ? (totalMonthlyIncome - (localData.monthlyExpenses || 0)) / totalMonthlyIncome : 0;
  
  const totalAssets = Object.values(localData.assets || {}).reduce((a, b) => (a as number) + (b as number), 0) as number;
  const totalLiabilities = Object.values(localData.liabilities || {}).reduce((a, b) => (a as number) + (b as number), 0) as number;
  const netWorth = totalAssets - totalLiabilities;

  const withdrawalRate = localData.withdrawalRate || 0.04;
  const retirementCapitalRequired = (bufferedExpenses * 12) / withdrawalRate;
  const totalGoalsCost = (localData.freedomGoals || []).reduce((sum, goal) => sum + goal.cost, 0);
  const freedomNumber = retirementCapitalRequired + totalGoalsCost;

  // Wealth Plan Projections
  const projections = useMemo(() => {
    const years = 30; // Always calculate up to 30 years for the chart
    const start = localData.startingCapital ?? netWorth;
    const monthly = localData.monthlyInvestment || 0;
    const annualInc = localData.annualIncrease || 0;
    const irr = localData.targetIrr || 0.12;
    
    const results = [];
    let currentBalance = start;
    let currentMonthly = monthly;

    for (let year = 0; year <= years; year++) {
      results.push({ 
        year, 
        balance: Math.round(currentBalance),
        freedomNumber: Math.round(freedomNumber)
      });
      
      // Compound for the year
      for (let month = 0; month < 12; month++) {
        currentBalance = currentBalance * (1 + irr / 12) + currentMonthly;
      }
      currentMonthly *= (1 + annualInc);
    }
    return results;
  }, [localData, netWorth, freedomNumber]);

  const userTimelineProjection = projections.find(p => p.year === (localData.timelineYears || 20));
  const finalBalance = userTimelineProjection?.balance || 0;
  const freedomRatio = freedomNumber > 0 ? netWorth / freedomNumber : 0;
  const passiveIncomeRatio = bufferedExpenses > 0 ? (localData.monthlyPassiveIncome || 0) / bufferedExpenses : 0;

  const renderStep = () => {
    switch (activeStep) {
      case 'start':
        return (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-bg/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-bg/10 text-brand-bg flex items-center justify-center">
                    <Calculator size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Welcome to the Freedom Calculator</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                  Think of this tool like a GPS for YOUR wealth. We'll help you establish your starting point, 
                  define your destination, and build a practical roadmap to get there.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Establish your true financial baseline",
                    "Define your exact 'Freedom Number'",
                    "Build a 30-year wealth projection",
                    "Track progress with a live dashboard"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                      <CheckCircle2 className="text-emerald-500" size={20} />
                      {item}
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-8">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-brand-bg mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Disclaimer</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        In no way is the Freedom Calculator intended as offering you financial advice. 
                        You are always advised to speak with a licensed professional financial advisor before making any investment decisions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Select Your Base Currency</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {CURRENCIES.map(curr => (
                      <button
                        key={curr.code}
                        onClick={() => updateField('currency', curr.code)}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-bold transition-all",
                          localData.currency === curr.code
                            ? "bg-brand-bg text-white border-brand-bg shadow-lg shadow-brand-bg/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-bg/50"
                        )}
                      >
                        {curr.code} ({curr.symbol})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => goToStep('step1')}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-brand-bg text-white rounded-xl font-bold hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/20 group disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : null}
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'step1':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Income & Expenses */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <DollarSign size={20} className="text-emerald-500" />
                    Income Statement
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Earned Income</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyEarnedIncome || ''}
                          onChange={(e) => updateField('monthlyEarnedIncome', Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-bg/20 focus:border-brand-bg outline-none transition-all font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Passive Income</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyPassiveIncome || ''}
                          onChange={(e) => updateField('monthlyPassiveIncome', Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-bg/20 focus:border-brand-bg outline-none transition-all font-bold text-emerald-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Expenses</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyExpenses || ''}
                          onChange={(e) => updateField('monthlyExpenses', Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-bg/20 focus:border-brand-bg outline-none transition-all font-bold text-rose-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expense Buffer (Lifestyle "Fat")</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {EXPENSE_BUFFERS.map(buffer => (
                          <button
                            key={buffer.value}
                            onClick={() => updateField('expenseBuffer', buffer.value)}
                            className={cn(
                              "py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                              localData.expenseBuffer === buffer.value
                                ? "bg-brand-bg text-white border-brand-bg"
                                : "bg-white text-slate-600 border-slate-200 hover:border-brand-bg/50"
                            )}
                          >
                            {buffer.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Monthly Savings Rate</p>
                      <p className="text-3xl font-bold text-emerald-900">{(savingsRate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Monthly Surplus</p>
                      <p className="text-xl font-bold text-emerald-900">{currencySymbol}{(totalMonthlyIncome - (localData.monthlyExpenses || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets & Liabilities */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Home size={20} className="text-brand-bg" />
                    Balance Sheet
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Assets</p>
                      {Object.keys(localData.assets || {}).map(key => (
                        <div key={key}>
                          <label className="block text-[10px] font-bold text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                            <input
                              type="number"
                              value={(localData.assets as any)?.[key] || ''}
                              onChange={(e) => updateField(`assets.${key}`, Number(e.target.value))}
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Liabilities</p>
                      {Object.keys(localData.liabilities || {}).map(key => (
                        <div key={key}>
                          <label className="block text-[10px] font-bold text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                            <input
                              type="number"
                              value={(localData.liabilities as any)?.[key] || ''}
                              onChange={(e) => updateField(`liabilities.${key}`, Number(e.target.value))}
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-rose-500 transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-bg/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10">
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Current Net Worth</p>
                    <p className={cn(
                      "text-4xl font-bold tracking-tight",
                      netWorth >= 0 ? "text-white" : "text-rose-400"
                    )}>
                      {currencySymbol}{netWorth.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep('start')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={() => goToStep('step2')}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-brand-bg text-white rounded-xl font-bold hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/20 group disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : null}
                Next: Freedom Number
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'step2':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Target size={20} className="text-brand-bg" />
                      Life Goals & Destinations
                    </h4>
                    <button
                      onClick={() => {
                        const newGoal: FreedomGoal = { id: Math.random().toString(36).substr(2, 9), title: '', cost: 0 };
                        updateField('freedomGoals', [...(localData.freedomGoals || []), newGoal]);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-bg/10 text-brand-bg rounded-lg text-xs font-bold hover:bg-brand-bg/20 transition-all"
                    >
                      <Plus size={16} />
                      Add Goal
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(localData.freedomGoals || []).length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                        <p className="text-slate-400 font-medium">No custom goals added yet.</p>
                        <p className="text-xs text-slate-300 mt-1">Add things like children's education, weddings, or travel.</p>
                      </div>
                    )}
                    {(localData.freedomGoals || []).map((goal, index) => (
                      <div key={goal.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Goal Description</label>
                          <input
                            type="text"
                            value={goal.title}
                            onChange={(e) => {
                              const newGoals = [...(localData.freedomGoals || [])];
                              newGoals[index].title = e.target.value;
                              updateField('freedomGoals', newGoals);
                            }}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                            placeholder="e.g. Children's University Fund"
                          />
                        </div>
                        <div className="w-40">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Cost</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                            <input
                              type="number"
                              value={goal.cost || ''}
                              onChange={(e) => {
                                const newGoals = [...(localData.freedomGoals || [])];
                                newGoals[index].cost = Number(e.target.value);
                                updateField('freedomGoals', newGoals);
                              }}
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newGoals = (localData.freedomGoals || []).filter((_, i) => i !== index);
                            updateField('freedomGoals', newGoals);
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors mb-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Assumptions</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Expenses Baseline</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyExpensesOverride !== undefined ? localData.monthlyExpensesOverride : (localData.monthlyExpenses || '')}
                          onChange={(e) => updateField('monthlyExpensesOverride', e.target.value === '' ? undefined : Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                          placeholder={String(localData.monthlyExpenses || 0)}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Override your Step 1 expenses if needed.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assumed Inflation Rate</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={Math.round((localData.inflationRate || 0.06) * 1000) / 10}
                          onChange={(e) => updateField('inflationRate', Number(e.target.value) / 100)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Yield / Withdrawal Rate</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={Math.round((localData.withdrawalRate || 0.04) * 1000) / 10}
                          onChange={(e) => updateField('withdrawalRate', Number(e.target.value) / 100)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Default is 4% (Safe Withdrawal Rate).</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-bg p-6 rounded-2xl border border-brand-bg shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10 text-white">
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Total Freedom Number</p>
                    <p className="text-4xl font-bold tracking-tight">
                      {currencySymbol}{freedomNumber.toLocaleString()}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white">Retirement Capital:</span>
                        <span className="font-bold">{currencySymbol}{retirementCapitalRequired.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white">Other Goals:</span>
                        <span className="font-bold">{currencySymbol}{totalGoalsCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep('step1')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={() => goToStep('step3')}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-brand-bg text-white rounded-xl font-bold hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/20 group disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : null}
                Next: Wealth Plan
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'step3':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-bg" />
                    Projection Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting Capital</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                          <input
                            type="number"
                            value={localData.startingCapital ?? netWorth}
                            onChange={(e) => updateField('startingCapital', Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Defaults to your current Net Worth</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Investment</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                          <input
                            type="number"
                            value={localData.monthlyInvestment || ''}
                            onChange={(e) => updateField('monthlyInvestment', Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual Contribution Increase</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={(localData.annualIncrease || 0.05) * 100}
                            onChange={(e) => updateField('annualIncrease', Number(e.target.value) / 100)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Average IRR</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={(localData.targetIrr || 0.12) * 100}
                            onChange={(e) => updateField('targetIrr', Number(e.target.value) / 100)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-bg"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Horizon (Years)</label>
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={localData.timelineYears || 20}
                          onChange={(e) => updateField('timelineYears', Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-bg mt-4"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] font-bold text-slate-400">1 Year</span>
                          <span className="text-sm font-bold text-brand-bg">{localData.timelineYears || 20} Years</span>
                          <span className="text-[10px] font-bold text-slate-400">40 Years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Growth Projection (30 Year Horizon)</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-brand-bg rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Projected Wealth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-400 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Freedom Number</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="year" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          ticks={[0, 5, 10, 20, 30]}
                        />
                        <YAxis 
                          hide 
                          domain={[0, 'auto']}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Year {label}</p>
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold flex justify-between gap-4">
                                      <span className="text-white">Wealth:</span>
                                      <span>{currencySymbol}{payload[0].value.toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm font-bold flex justify-between gap-4">
                                      <span className="text-white">Target:</span>
                                      <span className="text-rose-400">{currencySymbol}{payload[1].value.toLocaleString()}</span>
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorBalance)" 
                          animationDuration={1500}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="freedomNumber" 
                          stroke="#fb7185" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="transparent"
                          animationDuration={1500}
                        />
                        <ReferenceLine 
                          x={localData.timelineYears || 20} 
                          stroke="#2563eb" 
                          strokeDasharray="3 3"
                          label={{ 
                            position: 'top', 
                            value: 'Your Target', 
                            fill: '#2563eb', 
                            fontSize: 10, 
                            fontWeight: 900 
                          }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">The Result</h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Projected Capital</p>
                      <p className="text-3xl font-bold text-slate-900">{currencySymbol}{Math.round(finalBalance).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Projected Monthly Passive</p>
                      <p className="text-2xl font-bold text-emerald-600">{currencySymbol}{Math.round((finalBalance * 0.04) / 12).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Based on 4% safe withdrawal rate</p>
                    </div>
                    
                    <div className={cn(
                      "p-4 rounded-xl border flex items-center gap-3",
                      finalBalance >= freedomNumber 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    )}>
                      {finalBalance >= freedomNumber ? (
                        <>
                          <ShieldCheck size={24} />
                          <div>
                            <p className="text-xs font-bold">Plan Successful</p>
                            <p className="text-[10px] opacity-80">You exceed your Freedom Number by {currencySymbol}{Math.round(finalBalance - freedomNumber).toLocaleString()}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Info size={24} />
                          <div>
                            <p className="text-xs font-bold">Gap Identified</p>
                            <p className="text-[10px] opacity-80">You are short by {currencySymbol}{Math.round(freedomNumber - finalBalance).toLocaleString()}. Adjust parameters.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep('step2')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={() => goToStep('step4')}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-brand-bg text-white rounded-xl font-bold hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/20 group disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : null}
                Next: Dashboard
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'step4':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Freedom Ratio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={351.8}
                      strokeDashoffset={351.8 * (1 - Math.min(1, freedomRatio))}
                      className="text-brand-bg"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-slate-900">{Math.round(freedomRatio * 100)}%</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Freedom Ratio</h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Actual Net Worth / Target</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {freedomRatio >= 1 ? 'Freedom Achieved' : freedomRatio > 0.5 ? 'On Track' : 'Early Stages'}
                </div>
              </div>

              {/* Passive Income Ratio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={351.8}
                      strokeDashoffset={351.8 * (1 - Math.min(1, passiveIncomeRatio))}
                      className="text-emerald-500"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-slate-900">{Math.round(passiveIncomeRatio * 100)}%</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Passive Income Coverage</h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Passive Income / Expenses</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  {passiveIncomeRatio >= 1 ? 'Fully Covered' : passiveIncomeRatio > 0.2 ? 'Partial Coverage' : 'Building'}
                </div>
              </div>

              {/* Savings Rate */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={351.8}
                      strokeDashoffset={351.8 * (1 - Math.min(1, savingsRate))}
                      className="text-blue-500"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-slate-900">{Math.round(savingsRate * 100)}%</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Savings Rate</h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Surplus / Total Income</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-blue-50 text-[10px] font-black uppercase tracking-widest text-blue-600">
                  {savingsRate >= 0.3 ? 'Excellent' : savingsRate >= 0.15 ? 'Good' : 'Needs Focus'}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Net Worth</p>
                  <p className="text-2xl font-bold text-white">{currencySymbol}{netWorth.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Freedom Number</p>
                  <p className="text-2xl font-bold text-white">{currencySymbol}{freedomNumber.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Monthly Passive</p>
                  <p className="text-2xl font-bold text-emerald-400">{currencySymbol}{(localData.monthlyPassiveIncome || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Time to Freedom</p>
                  <p className="text-2xl font-bold text-brand-bg">{localData.timelineYears || 20} Years</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep('step3')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={() => goToStep('step5')}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-brand-bg text-white rounded-xl font-bold hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/20 group disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : null}
                Next: Wealth Rhythm
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'step5':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                    Wealth Rhythm Checklist
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={localData.rhythmStatus?.monthly || false}
                        onChange={(e) => updateField('rhythmStatus.monthly', e.target.checked)}
                        className="w-6 h-6 rounded-lg border-slate-300 text-brand-bg focus:ring-brand-bg mt-1"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Monthly Check-in</p>
                        <p className="text-sm text-slate-500 mt-1">Review markets, financial updates, and your investor education. Grow your knowledge of asset classes.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={localData.rhythmStatus?.quarterly || false}
                        onChange={(e) => updateField('rhythmStatus.quarterly', e.target.checked)}
                        className="w-6 h-6 rounded-lg border-slate-300 text-brand-bg focus:ring-brand-bg mt-1"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Quarterly Audit</p>
                        <p className="text-sm text-slate-500 mt-1">Re-check Step 1: Income, expenses, savings rate and net worth. Confirm monthly investment commitments.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={localData.rhythmStatus?.annually || false}
                        onChange={(e) => updateField('rhythmStatus.annually', e.target.checked)}
                        className="w-6 h-6 rounded-lg border-slate-300 text-brand-bg focus:ring-brand-bg mt-1"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Annual Review</p>
                        <p className="text-sm text-slate-500 mt-1">Review all metrics against targets. Update your Wealth Plan and Dashboard for the year ahead.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-brand-bg to-brand-bg/80 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10">
                    <Sparkles className="mb-4" size={32} />
                    <h4 className="text-2xl font-bold mb-4">Expert Eyes on Your Plan</h4>
                    <p className="text-white/80 leading-relaxed mb-8">
                      Once you've completed your Freedom Calculator, book a no-obligation FREE 1-hour chat with one of our Wealth Coaches.
                    </p>
                    <div className="space-y-4">
                      <a
                        href="https://diversifiedpassiveincome.com/call"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-6 py-4 bg-white text-brand-bg rounded-xl font-bold hover:bg-slate-50 transition-all group"
                      >
                        Book Discovery Call
                        <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a
                        href="https://www.skool.com/wealthuniversity/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-6 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all group"
                      >
                        Join Wealth University
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep('step4')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={() => handleSave()}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                Save My Freedom Plan
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Freedom Calculator</h2>
        <p className="text-slate-500 font-medium">Map your journey from where you are to financial freedom.</p>
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-brand-bg text-white font-bold shadow-md"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                )}
              >
                <Icon size={18} />
                <span className="text-xs uppercase tracking-widest">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
