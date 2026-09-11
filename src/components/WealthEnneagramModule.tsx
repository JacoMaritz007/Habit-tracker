import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  BrainCircuit, 
  Sparkles, 
  Shield, 
  Zap, 
  TrendingUp,
  Target,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WealthEnneagramModuleProps {
  onBack: () => void;
}

const WEALTH_PROFILES = [
  {
    id: 1,
    title: "The Principled Saver",
    superpower: "Impeccable discipline and ethical standards.",
    blindspot: "Over-rigidity can lead to missed opportunities.",
    icon: Shield
  },
  {
    id: 2,
    title: "The Generous Helper",
    superpower: "Natural connector and generous giver.",
    blindspot: "Neglecting personal wealth for others' needs.",
    icon: Sparkles
  },
  {
    id: 3,
    title: "The Goal Achiever",
    superpower: "Highly efficient and goal-oriented.",
    blindspot: "Linking self-worth solely to net worth.",
    icon: Target
  },
  {
    id: 4,
    title: "The Creative Individualist",
    superpower: "Creative and values-driven investor.",
    blindspot: "Emotional spending on 'unique' experiences.",
    icon: Zap
  },
  {
    id: 5,
    title: "The Analytical Investigator",
    superpower: "Deeply analytical and independent.",
    blindspot: "Analysis paralysis and fear of scarcity.",
    icon: BrainCircuit
  },
  {
    id: 6,
    title: "The Cautious Loyalist",
    superpower: "Exceptional risk management and loyalty.",
    blindspot: "Excessive worry can prevent bold moves.",
    icon: Shield
  },
  {
    id: 7,
    title: "The Visionary Enthusiast",
    superpower: "Visionary and quick to see opportunities.",
    blindspot: "Lack of focus and impulsive diversification.",
    icon: TrendingUp
  },
  {
    id: 8,
    title: "The Decisive Challenger",
    superpower: "Decisive and Visionary.",
    blindspot: "Over-leveraging due to a need for control.",
    icon: Zap
  },
  {
    id: 9,
    title: "The Steady Peacemaker",
    superpower: "Calm and steady long-term investor.",
    blindspot: "Avoiding financial conflict or decisions.",
    icon: Shield
  }
];

const trackEvent = (eventName: string) => {
  console.log(`[Analytics] Event Tracked: ${eventName}`);
};

export const WealthEnneagramModule: React.FC<WealthEnneagramModuleProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<number | null>(null);

  const nextStep = () => {
    trackEvent(`enneagram_step_${step}_completed`);
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleCtaClick = () => {
    trackEvent('enneagram_cta_clicked');
    window.open('https://www.integrative9.com/enneagram/test/individual/?ref=FREEDOM_APP', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[600px] flex flex-col">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row flex-1">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-bg/10 text-brand-bg rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <BrainCircuit size={12} />
                  The Psychology of Wealth
                </div>
                <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                  95% of your financial decisions are subconscious.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Older than modern religion and used by top Family Offices, the Enneagram is the ultimate framework for understanding your relationship with money, risk, and partnerships.
                </p>
                <div className="pt-4">
                  <button
                    onClick={nextStep}
                    className="group px-8 py-4 bg-brand-bg text-white rounded-2xl font-bold text-lg hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/30 flex items-center gap-3"
                  >
                    Next <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 bg-slate-50 relative overflow-hidden flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-bg/20 via-transparent to-brand-accent/20" />
                <div className="relative z-10 w-full aspect-square max-w-[300px]">
                  {/* Abstract Graphic Placeholder */}
                  <div className="w-full h-full rounded-full border-4 border-dashed border-brand-bg/30 animate-spin-slow flex items-center justify-center">
                    <div className="w-4/5 h-4/5 rounded-full border-4 border-dashed border-brand-accent/30 animate-reverse-spin-slow flex items-center justify-center">
                      <div className="w-3/5 h-3/5 rounded-full bg-brand-bg/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                        <BrainCircuit size={64} className="text-brand-bg" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 left-1/4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-brand-bg"
                >
                  <Shield size={24} />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-brand-accent"
                >
                  <TrendingUp size={24} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Which Investor Are You?</h2>
              <p className="text-slate-500 font-medium">Tap a number to reveal your wealth archetype.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full">
              {WEALTH_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setSelectedType(profile.id);
                    trackEvent(`enneagram_type_${profile.id}_viewed`);
                  }}
                  className={cn(
                    "aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center group",
                    selectedType === profile.id 
                      ? "bg-brand-bg border-brand-bg text-white shadow-lg shadow-brand-bg/20 scale-105" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-brand-bg/30 hover:text-brand-bg"
                  )}
                >
                  <span className={cn(
                    "text-lg font-black leading-none",
                    selectedType === profile.id ? "text-white" : "text-slate-900 group-hover:text-brand-bg"
                  )}>
                    {profile.id}
                  </span>
                  <span className="text-[7px] font-bold uppercase tracking-widest opacity-50">Type</span>
                </button>
              ))}
            </div>

            <div className="min-h-[160px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {selectedType ? (
                  <motion.div
                    key={selectedType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg w-full max-w-2xl"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-brand-bg/10 text-brand-bg rounded-xl flex items-center justify-center">
                        {React.createElement(WEALTH_PROFILES[selectedType - 1].icon, { size: 24 })}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Type {selectedType}: {WEALTH_PROFILES[selectedType - 1].title}
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                          <Sparkles size={14} /> Wealth Superpower
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {WEALTH_PROFILES[selectedType - 1].superpower}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                          <AlertCircle size={14} /> Wealth Blindspot
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {WEALTH_PROFILES[selectedType - 1].blindspot}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-slate-400 italic text-sm">
                    Select a type above to explore...
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-8">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={nextStep}
                className="group px-8 py-4 bg-brand-bg text-white rounded-2xl font-bold hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/30 flex items-center gap-3"
              >
                Next <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row flex-1">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                    Unlock Your Wealth Blueprint
                  </h2>
                  <div className="space-y-4">
                    {[
                      "Uncover your subconscious money blocks.",
                      "Understand how you behave in financial partnerships.",
                      "Learn how to make 'Smart Investments' based on your personality."
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} />
                        </div>
                        <p className="text-slate-600 font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleCtaClick}
                    className="w-full group px-8 py-5 bg-brand-bg text-white rounded-2xl font-bold text-lg hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/30 flex items-center justify-center gap-3"
                  >
                    Take the Official Enneagram Test <ExternalLink size={20} />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                    Test administered by Integrative9, a global leader in Enneagram profiling.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm"
                  >
                    <ArrowLeft size={16} /> Back to profiles
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 bg-brand-bg relative overflow-hidden flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative z-10 text-center space-y-6">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center mx-auto shadow-2xl">
                    <Target size={48} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Your Roadmap Awaits</h3>
                    <p className="text-white text-sm font-medium">
                      Join 10,000+ investors who have mastered their psychology.
                    </p>
                  </div>
                  {/* Mock Result Preview */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-left space-y-3">
                    <div className="h-2 w-2/3 bg-white/20 rounded-full" />
                    <div className="h-2 w-full bg-white/20 rounded-full" />
                    <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
