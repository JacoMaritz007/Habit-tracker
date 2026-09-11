import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, ArrowLeft, BrainCircuit } from 'lucide-react';
import { ENNEAGRAM_TYPES } from '../types';
import { cn } from '../lib/utils';

const QUESTIONS = [
  { id: 1, type: 1, text: "I feel a strong need to be financially perfect and follow a strict budget." },
  { id: 2, type: 2, text: "I often find myself spending money to help or please others." },
  { id: 3, type: 3, text: "My financial success is a direct reflection of my personal worth." },
  { id: 4, type: 4, text: "I prefer spending on unique, high-quality items that express my individuality." },
  { id: 5, type: 5, text: "I feel safer when I have a lot of detailed information about my investments." },
  { id: 6, type: 6, text: "I worry a lot about future financial crises and always have a backup plan." },
  { id: 7, type: 7, text: "I love spending money on new adventures and hate feeling restricted by a budget." },
  { id: 8, type: 8, text: "I use my wealth to ensure I am never controlled by anyone else." },
  { id: 9, type: 9, text: "I tend to ignore my bank balance because thinking about money stresses me out." },
  { id: 10, type: 1, text: "I get frustrated when others are irresponsible with their money." },
  { id: 11, type: 2, text: "I feel guilty if I don't share my financial abundance with those in need." },
  { id: 12, type: 3, text: "I am constantly looking for ways to improve my financial status and image." },
  { id: 13, type: 4, text: "I find ordinary financial planning boring and uninspiring." },
  { id: 14, type: 5, text: "I'd rather save my money than spend it on things I don't absolutely need." },
  { id: 15, type: 6, text: "I often seek advice from experts before making any financial move." },
  { id: 16, type: 7, text: "I believe money is meant to be enjoyed now, not just hoarded for later." },
  { id: 17, type: 8, text: "I am very protective of my financial resources and those I care about." },
  { id: 18, type: 9, text: "I'd rather keep the peace than argue about money with my partner." },
  { id: 19, type: 1, text: "I have very high standards for my financial advisors and institutions." },
  { id: 20, type: 2, text: "I often put others' financial needs before my own." },
];

const OPTIONS = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
];

export const WealthEnneagramTest = ({ onComplete }: { onComplete: (typeId: number) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [QUESTIONS[currentStep].id]: value });
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateResult = () => {
    const scores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    
    QUESTIONS.forEach(q => {
      const answerValue = answers[q.id] || 0;
      scores[q.type] += answerValue;
    });

    let maxScore = -1;
    let resultType = 1;

    Object.entries(scores).forEach(([type, score]) => {
      if (score > maxScore) {
        maxScore = score;
        resultType = parseInt(type);
      }
    });

    return resultType;
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  if (isFinished) {
    const resultId = calculateResult();
    const resultType = ENNEAGRAM_TYPES.find(t => t.id === resultId);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Test Complete!</h2>
          <p className="text-sm text-slate-500 mb-8">We've analyzed your responses. Your Wealth Enneagram type is:</p>
          
          <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-100 shadow-inner text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-brand-bg text-white rounded-lg flex items-center justify-center font-bold text-base shadow-lg shadow-brand-bg/20">
                {resultType?.id}
              </div>
              <h3 className="text-xl font-bold text-brand-bg tracking-tight">{resultType?.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{resultType?.description}</p>
          </div>

          <button
            onClick={() => onComplete(resultId)}
            className="w-full py-4 bg-brand-bg text-white rounded-xl font-bold text-base hover:bg-brand-bg/90 transition-all shadow-lg shadow-brand-bg/20 flex items-center justify-center gap-2"
          >
            Save Result & Continue <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-[10px] font-black text-brand-bg uppercase tracking-[0.2em] mb-1 block">Wealth Enneagram Test</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Question {currentStep + 1} of {QUESTIONS.length}</h2>
          </div>
          <span className="text-lg font-black text-brand-bg">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-brand-bg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />
          
          <p className="relative z-10 text-xl font-bold text-slate-800 mb-8 leading-relaxed tracking-tight">
            "{QUESTIONS[currentStep].text}"
          </p>

          <div className="grid grid-cols-1 gap-3 relative z-10">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={cn(
                  "w-full p-4 rounded-xl text-left text-sm font-bold transition-all border-2",
                  answers[QUESTIONS[currentStep].id] === opt.value
                    ? "bg-brand-bg text-white border-brand-bg shadow-lg shadow-brand-bg/20 scale-[1.01]"
                    : "bg-slate-50/50 text-slate-600 border-slate-100 hover:border-brand-bg/30 hover:bg-white hover:shadow-md"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <button
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 px-6 py-3 text-slate-400 font-bold hover:text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-0 transition-all text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <BrainCircuit size={16} className="text-brand-bg animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">Analyzing Patterns...</span>
        </div>
      </div>
    </div>
  );
};
