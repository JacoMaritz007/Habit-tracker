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
import { freedomNumber as calcFreedomNumber, project, formatDuration, MAX_YEARS } from '../lib/freedom';
import { InfoTip } from './InfoTip';
import { RingGauge } from './RingGauge';
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


// Plain-language explanations shown in the metric tooltips.
const HELP = {
  earnedIncome: 'Money you earn by working each month, after tax: salary, commission or business drawings.',
  passiveIncome: 'Money that arrives each month without you working for it: rent, dividends, interest, royalties.',
  expenses: 'What you spend in a normal month to live: housing, food, transport, insurance, school fees, debt repayments.',
  expenseBuffer: 'Extra on top of your expenses for lifestyle upgrades and surprises. A 10% buffer plans for living costs 10% higher than today.',
  monthlySavingsRate: 'Share of your monthly income left after expenses: (income − expenses) ÷ income. The higher it is, the faster you can invest.',
  monthlySurplus: 'Income minus expenses each month. This is the money available to invest.',
  netWorth: 'Everything you own (assets) minus everything you owe (liabilities). It includes things like your home and business, which may not produce income.',
  expensesBaseline: 'The monthly living cost your freedom must cover. It starts as your expenses from step 1; change it if you expect to live differently once free.',
  inflation: 'How fast prices rise each year. Your Freedom Number is in today\u2019s money; in projections it grows by this rate, so the target reflects what freedom will cost in future.',
  withdrawalRate: 'How much of your capital you can draw each year without running out. 4% means every R1m funds about R40,000 a year. A lower rate is safer but needs more capital.',
  freedomNumber: 'The capital you need to live off your investments: buffered yearly expenses ÷ withdrawal rate, plus once-off freedom goals. Shown in today\u2019s money.',
  retirementCapital: 'The part of your Freedom Number that funds your living costs: buffered monthly expenses × 12 ÷ withdrawal rate.',
  goalsCost: 'Once-off amounts you want to fund on top of your living costs, such as a home, education or travel.',
  startingCapital: 'Money you already have working for you towards freedom: investments, savings and other income-producing assets. Leave out your home unless you plan to sell it.',
  monthlyInvestment: 'How much you will add to your investments each month.',
  annualIncrease: 'How much you raise your monthly investment each year, for example with salary increases. 5% means R10,000 a month becomes R10,500 next year.',
  growthRate: 'The average yearly return you expect on your investments before inflation. The projection compounds it monthly. Higher returns usually mean more risk.',
  timeHorizon: 'The year the Result card reports on. It doesn\u2019t change your Time to Freedom, which is worked out separately.',
  projectedCapital: 'What your capital could grow to by the end of your time horizon, using your starting capital, monthly investment, yearly increase and growth rate. A projection, not a guarantee.',
  projectedPassive: 'The monthly income your projected capital could pay you at your withdrawal rate: capital × withdrawal rate ÷ 12.',
  timeToFreedom: `How long until your projected capital first reaches your Freedom Number, with the target rising each year by inflation. If it isn\u2019t reached within ${MAX_YEARS} years you\u2019ll see why instead of a date. A projection, not a guarantee.`,
  freedomRatio: 'How far you are towards your Freedom Number today: current net worth ÷ Freedom Number. 100% means your net worth equals the target.',
  passiveCoverage: 'How much of your buffered monthly expenses your current passive income already covers: passive income ÷ buffered expenses. 100% means you could stop working today.',
  savingsRate: 'Share of your monthly income left after expenses: (income − expenses) ÷ income. Above 30% is excellent; below 15% needs focus.',
  monthlyPassive: 'The passive income you receive today, from step 1.',
};

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

  // Zero is a valid rate, so fall back to defaults only when a value is missing.
  const withdrawalRate = localData.withdrawalRate ?? 0.04;
  const inflationRate = localData.inflationRate ?? 0.06;
  const growthRate = localData.targetIrr ?? 0.12;
  const annualIncrease = localData.annualIncrease ?? 0.05;
  const timelineYears = localData.timelineYears ?? 20;
  const startingCapital = localData.startingCapital ?? netWorth;
  const totalGoalsCost = (localData.freedomGoals || []).reduce((sum, goal) => sum + (goal.cost || 0), 0);
  const { retirementCapital: retirementCapitalRequired, total: freedomNumber } = calcFreedomNumber({
    monthlyExpenses: baseMonthlyExpenses,
    expenseBuffer: localData.expenseBuffer ?? 0,
    withdrawalRate,
    goalsCost: totalGoalsCost,
  });

  // Wealth Plan projection (see src/lib/freedom.ts for the method).
  const { yearly, timeToFreedom } = useMemo(() => project({
    freedomNumber,
    startingCapital,
    monthlyInvestment: localData.monthlyInvestment ?? 0,
    annualIncrease,
    growthRate,
    inflationRate,
  }), [freedomNumber, startingCapital, localData.monthlyInvestment, annualIncrease, growthRate, inflationRate]);
  // The chart shows 30 years; the time-to-freedom search runs to MAX_YEARS.
  const projections = yearly.slice(0, 31).map(p => ({ year: p.year, balance: Math.round(p.balance), freedomNumber: Math.round(p.target) }));

  const horizon = yearly.find(p => p.year === timelineYears) ?? yearly[yearly.length - 1];
  const finalBalance = horizon.balance;
  const targetAtHorizon = horizon.target;
  const freedomRatio = freedomNumber > 0 ? netWorth / freedomNumber : 0;
  const passiveIncomeRatio = bufferedExpenses > 0 ? (localData.monthlyPassiveIncome || 0) / bufferedExpenses : 0;
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  const money = (n: number) => `${currencySymbol}${Math.round(n).toLocaleString()}`;

  const timeToFreedomText = timeToFreedom.status === 'already-free' ? 'Already free'
    : timeToFreedom.status === 'reached' ? formatDuration(timeToFreedom)
    : timeToFreedom.status === 'not-reached' ? `Not within ${MAX_YEARS} yrs`
    : '—';
  const freedomDate = timeToFreedom.status === 'reached'
    ? new Date(new Date().getFullYear(), new Date().getMonth() + timeToFreedom.months, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;
  const assumptionsText = `Projected, not guaranteed. Assumes ${pct(growthRate)} yearly growth, ${pct(inflationRate)} inflation (your Freedom Number rises with it), `
    + `${money(localData.monthlyInvestment ?? 0)} invested monthly rising ${pct(annualIncrease)} a year, starting from ${money(startingCapital)}.`;

  const renderStep = () => {
    switch (activeStep) {
      case 'start':
        return (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-ink flex items-center justify-center">
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
                    <ShieldCheck className="text-ink mt-1" size={20} />
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
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
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
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
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
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Earned Income <InfoTip text={HELP.earnedIncome} /></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyEarnedIncome || ''}
                          onChange={(e) => updateField('monthlyEarnedIncome', Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-focus/30 focus:border-focus outline-none transition-all font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Passive Income <InfoTip text={HELP.passiveIncome} /></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyPassiveIncome || ''}
                          onChange={(e) => updateField('monthlyPassiveIncome', Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-focus/30 focus:border-focus outline-none transition-all font-bold text-emerald-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Expenses <InfoTip text={HELP.expenses} /></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyExpenses || ''}
                          onChange={(e) => updateField('monthlyExpenses', Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-focus/30 focus:border-focus outline-none transition-all font-bold text-rose-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expense Buffer (Lifestyle "Fat") <InfoTip text={HELP.expenseBuffer} /></label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {EXPENSE_BUFFERS.map(buffer => (
                          <button
                            key={buffer.value}
                            onClick={() => updateField('expenseBuffer', buffer.value)}
                            className={cn(
                              "py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                              localData.expenseBuffer === buffer.value
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
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
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Monthly Savings Rate <InfoTip text={HELP.monthlySavingsRate} /></p>
                      <p className="text-3xl font-bold text-emerald-900">{(savingsRate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Monthly Surplus <InfoTip text={HELP.monthlySurplus} /></p>
                      <p className="text-xl font-bold text-emerald-900">{currencySymbol}{(totalMonthlyIncome - (localData.monthlyExpenses || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets & Liabilities */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Home size={20} className="text-ink" />
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
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus transition-all"
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

                <div className="brand-gradient p-6 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10">
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Current Net Worth <InfoTip dark text={HELP.netWorth} /></p>
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
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
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
                      <Target size={20} className="text-ink" />
                      Life Goals & Destinations
                    </h4>
                    <button
                      onClick={() => {
                        const newGoal: FreedomGoal = { id: Math.random().toString(36).substr(2, 9), title: '', cost: 0 };
                        updateField('freedomGoals', [...(localData.freedomGoals || []), newGoal]);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-ink rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
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
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                            placeholder="e.g. Children's University Fund"
                          />
                        </div>
                        <div className="w-40">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Cost <InfoTip text={HELP.goalsCost} /></label>
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
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
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
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Expenses Baseline <InfoTip text={HELP.expensesBaseline} /></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          value={localData.monthlyExpensesOverride !== undefined ? localData.monthlyExpensesOverride : (localData.monthlyExpenses || '')}
                          onChange={(e) => updateField('monthlyExpensesOverride', e.target.value === '' ? undefined : Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                          placeholder={String(localData.monthlyExpenses || 0)}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Override your Step 1 expenses if needed.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assumed Inflation Rate <InfoTip text={HELP.inflation} /></label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={Math.round(inflationRate * 1000) / 10}
                          onChange={(e) => updateField('inflationRate', Number(e.target.value) / 100)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Yield / Withdrawal Rate <InfoTip text={HELP.withdrawalRate} /></label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={Math.round(withdrawalRate * 1000) / 10}
                          onChange={(e) => updateField('withdrawalRate', Number(e.target.value) / 100)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Default is 4% (Safe Withdrawal Rate).</p>
                    </div>
                  </div>
                </div>

                <div className="brand-gradient p-6 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="relative z-10 text-white">
                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Total Freedom Number <InfoTip dark text={HELP.freedomNumber} /></p>
                    <p className="text-4xl font-bold tracking-tight">
                      {currencySymbol}{freedomNumber.toLocaleString()}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white flex items-center gap-1.5">Retirement Capital <InfoTip dark text={HELP.retirementCapital} /></span>
                        <span className="font-bold">{currencySymbol}{retirementCapitalRequired.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white flex items-center gap-1.5">Other Goals <InfoTip dark text={HELP.goalsCost} /></span>
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
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
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
                    <TrendingUp size={20} className="text-ink" />
                    Projection Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting Capital <InfoTip text={HELP.startingCapital} /></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                          <input
                            type="number"
                            value={localData.startingCapital ?? netWorth}
                            onChange={(e) => updateField('startingCapital', Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Defaults to your current Net Worth</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Investment <InfoTip text={HELP.monthlyInvestment} /></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                          <input
                            type="number"
                            value={localData.monthlyInvestment || ''}
                            onChange={(e) => updateField('monthlyInvestment', Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual Contribution Increase <InfoTip text={HELP.annualIncrease} /></label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={Math.round(annualIncrease * 1000) / 10}
                            onChange={(e) => updateField('annualIncrease', Number(e.target.value) / 100)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Average IRR <InfoTip text={HELP.growthRate} /></label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={Math.round(growthRate * 1000) / 10}
                            onChange={(e) => updateField('targetIrr', Number(e.target.value) / 100)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-focus"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Horizon (Years) <InfoTip text={HELP.timeHorizon} /></label>
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={timelineYears}
                          onChange={(e) => updateField('timelineYears', Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary mt-4"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] font-bold text-slate-400">1 Year</span>
                          <span className="text-sm font-bold text-ink">{timelineYears} Years</span>
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
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Projected Wealth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-400 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Freedom Number (rises with inflation)</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0077B6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0077B6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F6F8" />
                        <XAxis 
                          dataKey="year" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#7B8794' }}
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
                                <div className="bg-ink text-white p-3 rounded-xl border border-slate-700 shadow-xl">
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
                          stroke="#0077B6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorBalance)" 
                          animationDuration={1500}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="freedomNumber" 
                          stroke="#D93F3F" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="transparent"
                          animationDuration={1500}
                        />
                        <ReferenceLine 
                          x={timelineYears} 
                          stroke="#0077B6" 
                          strokeDasharray="3 3"
                          label={{ 
                            position: 'top', 
                            value: 'Your Target', 
                            fill: '#0077B6', 
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
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">Projected Capital in {timelineYears} yrs <InfoTip text={HELP.projectedCapital} /></p>
                      <p className="text-3xl font-bold text-slate-900">{money(finalBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">Projected Monthly Passive <InfoTip text={HELP.projectedPassive} /></p>
                      <p className="text-2xl font-bold text-emerald-600">{money((finalBalance * withdrawalRate) / 12)}</p>
                      <p className="text-[10px] text-slate-400 mt-1">At your {pct(withdrawalRate)} withdrawal rate, in year {timelineYears}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">Time to Freedom <InfoTip text={HELP.timeToFreedom} /></p>
                      <p className="text-2xl font-bold text-primary-ink">{timeToFreedomText}</p>
                      {freedomDate && <p className="text-[10px] text-slate-400 mt-1">Projected around {freedomDate}</p>}
                      {timeToFreedom.status === 'not-reached' && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{timeToFreedom.reason}</p>}
                      {timeToFreedom.status === 'no-target' && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{timeToFreedom.reason}</p>}
                    </div>
                    
                    <div className={cn(
                      "p-4 rounded-xl border flex items-center gap-3",
                      finalBalance >= targetAtHorizon 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    )}>
                      {finalBalance >= targetAtHorizon ? (
                        <>
                          <ShieldCheck size={24} />
                          <div>
                            <p className="text-xs font-bold">Plan Successful</p>
                            <p className="text-[10px] opacity-80">In year {timelineYears} you exceed your inflation-adjusted Freedom Number ({money(targetAtHorizon)}) by {money(finalBalance - targetAtHorizon)}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Info size={24} />
                          <div>
                            <p className="text-xs font-bold">Gap Identified</p>
                            <p className="text-[10px] opacity-80">In year {timelineYears} you are short of your inflation-adjusted Freedom Number ({money(targetAtHorizon)}) by {money(targetAtHorizon - finalBalance)}. Adjust parameters.</p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{assumptionsText}</p>
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
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
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
                <div className="mb-4">
                  <RingGauge value={freedomRatio} className="text-primary" label={<span className="text-2xl font-bold text-slate-900">{Math.round(freedomRatio * 100)}%</span>} />
                </div>
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Freedom Ratio <InfoTip text={HELP.freedomRatio} /></h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Actual Net Worth / Target</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {freedomRatio >= 1 ? 'Freedom Achieved' : freedomRatio > 0.5 ? 'On Track' : 'Early Stages'}
                </div>
              </div>

              {/* Passive Income Ratio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="mb-4">
                  <RingGauge value={passiveIncomeRatio} className="text-emerald-500" label={<span className="text-2xl font-bold text-slate-900">{Math.round(passiveIncomeRatio * 100)}%</span>} />
                </div>
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Passive Income Coverage <InfoTip text={HELP.passiveCoverage} /></h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Passive Income / Expenses</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  {passiveIncomeRatio >= 1 ? 'Fully Covered' : passiveIncomeRatio > 0.2 ? 'Partial Coverage' : 'Building'}
                </div>
              </div>

              {/* Savings Rate */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="mb-4">
                  <RingGauge value={savingsRate} className="text-blue-500" label={<span className="text-2xl font-bold text-slate-900">{Math.round(savingsRate * 100)}%</span>} />
                </div>
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Savings Rate <InfoTip text={HELP.savingsRate} /></h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Surplus / Total Income</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-blue-50 text-[10px] font-black uppercase tracking-widest text-blue-600">
                  {savingsRate >= 0.3 ? 'Excellent' : savingsRate >= 0.15 ? 'Good' : 'Needs Focus'}
                </div>
              </div>
            </div>

            <div className="brand-gradient p-8 rounded-2xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Net Worth <InfoTip dark text={HELP.netWorth} /></p>
                  <p className="text-2xl font-bold text-white">{currencySymbol}{netWorth.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Freedom Number <InfoTip dark text={HELP.freedomNumber} /></p>
                  <p className="text-2xl font-bold text-white">{currencySymbol}{freedomNumber.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Monthly Passive <InfoTip dark text={HELP.monthlyPassive} /></p>
                  <p className="text-2xl font-bold text-emerald-400">{currencySymbol}{(localData.monthlyPassiveIncome || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-1.5">Time to Freedom <InfoTip dark text={HELP.timeToFreedom} /></p>
                  <p className="text-2xl font-bold text-primary">{timeToFreedomText}</p>
                  {freedomDate && <p className="text-xs text-white/70 mt-1">Projected around {freedomDate}</p>}
                  {(timeToFreedom.status === 'not-reached' || timeToFreedom.status === 'no-target') && (
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">{timeToFreedom.reason}</p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed -mt-4">{assumptionsText}</p>

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
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
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
                        className="w-6 h-6 rounded-lg border-slate-300 text-ink focus:ring-focus/30 mt-1"
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
                        className="w-6 h-6 rounded-lg border-slate-300 text-ink focus:ring-focus/30 mt-1"
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
                        className="w-6 h-6 rounded-lg border-slate-300 text-ink focus:ring-focus/30 mt-1"
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
                <div className="brand-gradient p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <Sparkles className="mb-4 text-primary" size={32} />
                    <h4 className="text-2xl font-bold mb-4 text-white">Expert Eyes on Your Plan</h4>
                    <p className="text-white/80 leading-relaxed mb-8">
                      Once you've completed your Freedom Calculator, book a no-obligation FREE 1-hour chat with one of our Wealth Coaches.
                    </p>
                    <div className="space-y-4">
                      <a
                        href="https://diversifiedpassiveincome.com/call"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-6 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover shadow-[0_8px_22px_rgba(244,124,32,.32)] transition-all group"
                      >
                        Book Discovery Call
                        <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a
                        href="https://www.skool.com/wealthuniversity/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-6 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all group"
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
                    ? "bg-primary text-white font-bold shadow-md"
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
