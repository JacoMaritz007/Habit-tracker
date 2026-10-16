import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Heart, 
  Plus, 
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Check,
  Brain,
  Zap,
  Target,
  Sun,
  TrendingUp,
  X
} from 'lucide-react';
import { AiCoachSection } from './AiCoachSection';
import { WealthEnneagramTest } from './WealthEnneagramTest';
import { WealthEnneagramModule } from './WealthEnneagramModule';
import { MoneyStoryCoach } from './MoneyStoryCoach';
import { MindsetCoach } from './MindsetCoach';
import { ENNEAGRAM_TYPES, GratitudeEntry, RitualEntry, MoneyStoryResponse } from '../types';
import { cn } from '../lib/utils';

const MONEY_STORY_QUESTIONS = [
  {
    id: 1,
    title: "EARLIEST MONEY MEMORY",
    question: "What is your earliest memory involving money?",
    description: "Think back as far as you can — a moment, a feeling, a conversation. What happened and how did it make you feel?",
    placeholder: "e.g. I remember my parents arguing about bills at the kitchen table when I was 7. I felt scared and decided I never wanted to worry about money..."
  },
  {
    id: 2,
    title: "CHILDHOOD MESSAGES",
    question: "What messages about money did you receive growing up?",
    description: "What did your parents or guardians say about money? Was it 'money doesn't grow on trees' or 'we always have enough'?",
    placeholder: "e.g. My parents always said we had to work hard for every penny. It made me feel like money is always a struggle..."
  },
  {
    id: 3,
    title: "MONEY EMOTION",
    question: "What emotion comes up most when you think about money right now?",
    description: "Is it anxiety, excitement, guilt, or peace? Be honest with yourself.",
    placeholder: "e.g. I feel a lot of anxiety when I check my bank balance, even when I know I have enough. It's like I'm waiting for something to go wrong..."
  },
  {
    id: 4,
    title: "WHAT YOU DESERVE",
    question: "Complete this sentence: \"When it comes to money, I believe I deserve...\"",
    description: "Don't overthink it. What's the first thing that comes to mind?",
    placeholder: "e.g. I believe I deserve to live comfortably without constant stress, but a part of me feels guilty for wanting more than my parents had..."
  },
  {
    id: 5,
    title: "LIMITING BELIEF",
    question: "What is one money belief that might be holding you back?",
    description: "Identify a thought that limits your potential or makes you play small.",
    placeholder: "e.g. I often think that 'rich people are greedy,' which makes me subconsciously avoid building wealth because I want to be a good person..."
  },
  {
    id: 6,
    title: "FINANCIAL STRENGTH",
    question: "When do you feel most confident and in control with your finances?",
    description: "Recall a time or a specific action that makes you feel empowered.",
    placeholder: "e.g. I feel most confident when I have a clear plan for the month and I see my savings growing, even if it's just a small amount..."
  },
  {
    id: 7,
    title: "RICH PEOPLE ARE...",
    question: "Complete this sentence: \"Rich people are...\"",
    description: "What are the common traits or stereotypes you associate with wealth?",
    placeholder: "e.g. Rich people are disciplined and have systems in place, but I also sometimes feel they are disconnected from reality..."
  },
  {
    id: 8,
    title: "FINANCIAL FREEDOM",
    question: "What does financial freedom look like to you — specifically?",
    description: "Describe your ideal life where money is no longer a constraint.",
    placeholder: "e.g. Financial freedom means being able to take a month off to travel with my family without worrying about bills, and having the resources to support causes I care about..."
  }
];

const PracticeCard = ({ title, description, icon: Icon, color, onClick, actionText }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/20 hover:shadow-md transition-all text-left flex flex-col h-full group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity" />
    <div className="relative z-10 flex flex-col h-full">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 border", color)}>
        <Icon size={20} />
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{description}</p>
      <div className="flex items-center gap-2 text-xs font-bold text-ink group-hover:gap-3 transition-all">
        {actionText} <ArrowRight size={14} />
      </div>
    </div>
  </button>
);

export const Mindset = ({ 
  userProfile, 
  gratitudeEntries, 
  rituals, 
  moneyStoryResponses,
  activeTab,
  setActiveTab,
  updateUserProfile, 
  onAddGratitude, 
  onDeleteGratitude,
  onAddRitual, 
  onDeleteRitual,
  onSaveMoneyStoryResponse,
  onSuggestAdvice,
  onSuggestMoneyStoryAdvice
}: { 
  userProfile: any,
  gratitudeEntries: GratitudeEntry[],
  rituals: RitualEntry[],
  moneyStoryResponses: MoneyStoryResponse[],
  activeTab: string,
  setActiveTab: (t: string) => void,
  updateUserProfile: (data: any) => Promise<void>,
  onAddGratitude: (content: string) => Promise<void>,
  onDeleteGratitude: (id: string) => Promise<void>,
  onAddRitual: (type: string) => Promise<void>,
  onDeleteRitual: (id: string) => Promise<void>,
  onSaveMoneyStoryResponse: (questionId: number, answer: string) => Promise<void>,
  onSuggestAdvice: (msg: string) => Promise<any>,
  onSuggestMoneyStoryAdvice: (msg: string) => Promise<any>
}) => {
  const [isSelectingType, setIsSelectingType] = useState(false);
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [newGratitude, setNewGratitude] = useState('');
  const [journal321, setJournal321] = useState({
    g1: '', g2: '', g3: '',
    i1: '', i2: '',
    a1: ''
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isViewingSummary, setIsViewingSummary] = useState(false);
  const [tempAnswers, setTempAnswers] = useState<Record<number, string>>({});
  const [customRitual, setCustomRitual] = useState('');
  const [isAddingCustomRitual, setIsAddingCustomRitual] = useState(false);

  // Map activeTab to internal view
  const view = activeTab === 'mindset-enneagram' ? 'enneagram' :
               activeTab === 'mindset-story' ? 'money-story' :
               activeTab === 'mindset-gratitude' ? 'gratitude' :
               activeTab === 'mindset-self-care' ? 'self-care' : 'landing';

  const setView = (v: 'landing' | 'enneagram' | 'money-story' | 'gratitude' | 'self-care') => {
    if (v === 'landing') setActiveTab('mindset');
    else if (v === 'enneagram') setActiveTab('mindset-enneagram');
    else if (v === 'money-story') setActiveTab('mindset-story');
    else if (v === 'gratitude') setActiveTab('mindset-gratitude');
    else if (v === 'self-care') setActiveTab('mindset-self-care');
  };

  const handleSelectType = async (typeId: number) => {
    await updateUserProfile({ enneagramType: typeId });
    setIsSelectingType(false);
    setIsTakingTest(false);
  };

  const handleSaveMoneyStory = async () => {
    // Save all pending answers
    for (const [qId, answer] of Object.entries(tempAnswers)) {
      if (answer.trim()) {
        await onSaveMoneyStoryResponse(Number(qId), answer);
      }
    }
    setIsAnswering(false);
    setIsViewingSummary(true);
  };

  const handleNextQuestion = async () => {
    const qId = MONEY_STORY_QUESTIONS[currentQuestionIndex].id;
    const answer = tempAnswers[qId];
    if (answer !== undefined && answer.trim()) {
      await onSaveMoneyStoryResponse(qId, answer);
    }
    setCurrentQuestionIndex(prev => Math.min(MONEY_STORY_QUESTIONS.length - 1, prev + 1));
  };

  const handlePrevQuestion = async () => {
    const qId = MONEY_STORY_QUESTIONS[currentQuestionIndex].id;
    const answer = tempAnswers[qId];
    if (answer !== undefined && answer.trim()) {
      await onSaveMoneyStoryResponse(qId, answer);
    }
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const getAnswer = (qId: number) => {
    return tempAnswers[qId] ?? moneyStoryResponses.find(r => r.questionId === qId)?.answer ?? '';
  };

  const currentType = ENNEAGRAM_TYPES.find(t => t.id === userProfile?.enneagramType);

  const renderLanding = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-ink rounded-xl flex items-center justify-center shadow-sm border border-primary/5">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Mindset Money</h3>
            <p className="text-sm text-slate-500">Four practices to transform your relationship with wealth.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <PracticeCard 
          title="Wealth Enneagram Test"
          description="Discover the personality type driving your financial decisions and unlock a roadmap to build wealth your way."
          icon={FileText}
          color="bg-indigo-50/50 text-indigo-600 border-indigo-100"
          actionText="Take the test"
          onClick={() => setView('enneagram')}
        />
        <PracticeCard 
          title="Understanding Your Money Story"
          description="Your beliefs about money were written before you had a say. Read that story — and decide what to keep."
          icon={BookOpen}
          color="bg-blue-50/50 text-blue-600 border-blue-100"
          actionText="Explore your story"
          onClick={() => setView('money-story')}
        />
        <PracticeCard 
          title="From Scarcity to Abundance"
          description="Daily gratitude practice rewires your brain from a scarcity mindset to one of abundance — one entry at a time."
          icon={Sparkles}
          color="bg-emerald-50/50 text-emerald-600 border-emerald-100"
          actionText="Begin the practice"
          onClick={() => setView('gratitude')}
        />
        <PracticeCard 
          title="Embracing Financial Self-Care"
          description="Managing your money isn't a chore — it's one of the most powerful acts of self-respect you can practice."
          icon={Heart}
          color="bg-rose-50/50 text-rose-600 border-rose-100"
          actionText="Start my ritual"
          onClick={() => setView('self-care')}
        />
      </div>
    </div>
  );

  const renderHeader = (title: string, onBack = () => setView('landing')) => (
    <div className="flex items-center gap-4 mb-8">
      <button 
        onClick={onBack}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
      >
        <ChevronLeft size={24} />
      </button>
      <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderLanding()}
          </motion.div>
        )}

        {view === 'enneagram' && (
          <motion.div 
            key="enneagram"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Wealth Enneagram</h2>
                <p className="text-sm text-slate-500 max-w-2xl">Discover the personality type driving your financial decisions and unlock your growth path.</p>
              </div>
              <button 
                onClick={() => setView('landing')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                <ChevronLeft size={16} /> Back to Practices
              </button>
            </div>
            
            <WealthEnneagramModule onBack={() => setView('landing')} />
          </motion.div>
        )}

        {view === 'money-story' && (
          <motion.div 
            key="money-story"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {isViewingSummary ? (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Your Money Story Summary</h2>
                    <p className="text-sm text-slate-500 max-w-2xl">A reflection of your financial subconscious and the path to a new narrative.</p>
                  </div>
                  <button 
                    onClick={() => setIsViewingSummary(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    <ChevronLeft size={16} /> Back to Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {MONEY_STORY_QUESTIONS.map((q, idx) => {
                    const answer = moneyStoryResponses.find(r => r.questionId === q.id)?.answer;
                    if (!answer) return null;
                    return (
                      <div key={q.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">{idx + 1}</span>
                          <h4 className="text-lg font-bold text-slate-900 tracking-tight">{q.question}</h4>
                        </div>
                        <div className="pl-11">
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap italic">"{answer}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 text-center">
                  <Sparkles size={32} className="text-ink mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">This is just the beginning.</h3>
                  <p className="text-slate-500 mb-6 max-w-lg mx-auto">You've surfaced the subconscious patterns. Now, you have the power to consciously choose a different path.</p>
                  <button 
                    onClick={() => {
                      setIsViewingSummary(false);
                      setIsAnswering(true);
                      setCurrentQuestionIndex(0);
                    }}
                    className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                  >
                    Edit Your Story
                  </button>
                </div>
              </div>
            ) : isAnswering ? (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Understanding Your Money Story</h2>
                    <p className="text-sm text-slate-500 max-w-2xl">Your beliefs about money were written before you had a say. Read that story — and decide what to keep.</p>
                  </div>
                  <button 
                    onClick={() => setIsAnswering(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    <ChevronLeft size={16} /> Exit Exercise
                  </button>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of 8</span>
                    <span className="text-base font-black text-ink">{Math.round(((currentQuestionIndex + 1) / MONEY_STORY_QUESTIONS.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / MONEY_STORY_QUESTIONS.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-black text-ink uppercase tracking-[0.2em] mb-2 block">{MONEY_STORY_QUESTIONS[currentQuestionIndex].title}</span>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight leading-tight">{MONEY_STORY_QUESTIONS[currentQuestionIndex].question}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{MONEY_STORY_QUESTIONS[currentQuestionIndex].description}</p>
                    </div>

                    <div className="relative">
                      <textarea
                        value={getAnswer(MONEY_STORY_QUESTIONS[currentQuestionIndex].id)}
                        onChange={(e) => setTempAnswers(prev => ({ ...prev, [MONEY_STORY_QUESTIONS[currentQuestionIndex].id]: e.target.value }))}
                        placeholder={MONEY_STORY_QUESTIONS[currentQuestionIndex].placeholder}
                        className="w-full h-48 p-6 rounded-xl border-2 border-slate-100 focus:border-focus focus:ring-0 transition-all text-base text-slate-900 resize-none shadow-inner bg-slate-50/50"
                      />
                      <p className="mt-4 text-xs text-slate-400 italic flex items-center gap-2">
                        <Sparkles size={12} /> There are no right or wrong answers. Write freely — this is for you alone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50 text-sm"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {MONEY_STORY_QUESTIONS.filter(q => getAnswer(q.id).trim().length > 0).length}/8 answered
                  </div>

                  {currentQuestionIndex === MONEY_STORY_QUESTIONS.length - 1 ? (
                    <button
                      onClick={handleSaveMoneyStory}
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 text-sm"
                    >
                      Complete Story <CheckCircle2 size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 text-sm"
                    >
                      Next <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Understanding Your Money Story</h2>
                    <p className="text-sm text-slate-500 max-w-2xl">Your beliefs about money were written before you had a say. Read that story — and decide what to keep.</p>
                  </div>
                  <button 
                    onClick={() => setView('landing')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    <ChevronLeft size={16} /> Back to Practices
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-8">
                    <div className="relative overflow-hidden rounded-2xl brand-gradient p-8 text-white shadow-lg min-h-[400px] flex flex-col justify-center">
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                          <BookOpen size={32} className="text-primary" />
                        </div>
                        
                        <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-6">
                          <h3 className="text-xl font-black tracking-tighter uppercase">Your Money Story</h3>
                        </div>

                        <p className="text-lg font-medium text-white leading-relaxed mb-10 max-w-lg">
                          Your beliefs about money were written before you had a say. This exercise helps you read that story — and decide what to keep.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
                              <RefreshCw size={20} className="animate-spin-slow text-indigo-200" />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] text-white uppercase tracking-[0.2em] font-black mb-0.5">Time Commitment</p>
                              <p className="font-black text-lg tracking-tight">~10 minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
                              <FileText size={20} className="text-indigo-200" />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] text-white uppercase tracking-[0.2em] font-black mb-0.5">Format</p>
                              <p className="font-black text-lg tracking-tight">8 deep questions</p>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setIsAnswering(true)}
                          className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-black text-lg hover:scale-105 hover:shadow-xl transition-all shadow-lg shadow-indigo-950/30 w-full sm:w-auto"
                        >
                          {moneyStoryResponses.length > 0 ? 'Continue Your Story' : 'Begin Your Story'} <ArrowRight size={20} className="inline ml-2" />
                        </button>

                        {moneyStoryResponses.length === 8 && (
                          <button 
                            onClick={() => setIsViewingSummary(true)}
                            className="px-8 py-4 bg-indigo-50 text-indigo-600 rounded-xl font-black text-lg hover:bg-indigo-100 transition-all border border-indigo-100 w-full sm:w-auto mt-4"
                          >
                            View Full Story Summary <ArrowRight size={20} className="inline ml-2" />
                          </button>
                        )}
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-white/20 to-transparent rounded-full blur-[80px] -mr-48 -mt-48" />
                      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-[60px] -ml-32 -mb-32" />
                    </div>
                  </div>

                  <MoneyStoryCoach 
                    onSuggest={onSuggestMoneyStoryAdvice}
                    className="h-full"
                  />
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Why this exercise changes everything</h3>
                      <p className="text-slate-500 text-sm">Understanding the roots of your financial behavior.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: "Your past shapes your wallet", desc: "Money beliefs formed in childhood run silently in the background of every financial decision you make — often without you knowing.", icon: Heart, color: "text-indigo-600 bg-indigo-50/50 border-indigo-100" },
                      { title: "Awareness is the first step", desc: "You can't rewrite a story you haven't read. Getting your beliefs on paper is how you start seeing them clearly for the first time.", icon: Sparkles, color: "text-amber-600 bg-amber-50/50 border-amber-100" },
                      { title: "Identify limiting beliefs", desc: "Limiting beliefs like \"I'm not good with money\" quietly sabotage your progress. This exercise surfaces them.", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50/50 border-emerald-100" },
                      { title: "Rewrite the narrative", desc: "Once you see your story, you get to decide what stays and what changes. That shift is where transformation begins.", icon: RefreshCw, color: "text-rose-600 bg-rose-50/50 border-rose-100" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 flex gap-6 hover:shadow-md transition-all group shadow-sm">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110", item.color)}>
                          <item.icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-ink flex items-center justify-center">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">What you'll explore</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MONEY_STORY_QUESTIONS.map((q, idx) => {
                      const answer = moneyStoryResponses.find(r => r.questionId === q.id)?.answer;
                      return (
                        <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-primary/20 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-primary-ink transition-colors">{q.question}</p>
                              <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", answer ? 'text-emerald-600' : 'text-slate-400')}>
                                {answer ? 'Completed' : 'Not answered'}
                              </p>
                            </div>
                          </div>
                          {answer && (
                            <button 
                              onClick={() => {
                                setCurrentQuestionIndex(idx);
                                setIsAnswering(true);
                              }}
                              className="text-xs font-bold text-ink opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg"
                            >
                              Edit <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {view === 'gratitude' && (
          <motion.div 
            key="gratitude"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">The Gratitude Practice</h2>
                <p className="text-sm text-slate-500 max-w-2xl">Rewire your neurobiology from scarcity to abundance through intentional daily recognition.</p>
              </div>
              <button 
                onClick={() => setView('landing')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                <ChevronLeft size={16} /> Back to Practices
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-2xl brand-gradient p-8 text-white shadow-lg min-h-[400px] flex flex-col justify-center">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                      <Sparkles size={32} className="text-white" />
                    </div>
                    
                    <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-6">
                      <h3 className="text-xl font-black tracking-tighter uppercase">The 3/2/1 Abundance Method</h3>
                    </div>

                    <p className="text-sm font-medium text-white/90 leading-relaxed mb-8 max-w-lg">
                      3 things you are grateful for • 2 things to improve (with positive intent) • 1 positive affirmation.
                    </p>
                    
                    <div className="w-full space-y-4 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">3 Things I'm Grateful For</label>
                        <div className="grid grid-cols-1 gap-2">
                          <input 
                            type="text"
                            value={journal321.g1}
                            onChange={(e) => setJournal321({...journal321, g1: e.target.value})}
                            placeholder="1. First thing..."
                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                          />
                          <input 
                            type="text"
                            value={journal321.g2}
                            onChange={(e) => setJournal321({...journal321, g2: e.target.value})}
                            placeholder="2. Second thing..."
                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                          />
                          <input 
                            type="text"
                            value={journal321.g3}
                            onChange={(e) => setJournal321({...journal321, g3: e.target.value})}
                            placeholder="3. Third thing..."
                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">2 Things to Improve (Positive Intent)</label>
                        <div className="grid grid-cols-1 gap-2">
                          <input 
                            type="text"
                            value={journal321.i1}
                            onChange={(e) => setJournal321({...journal321, i1: e.target.value})}
                            placeholder="1. I want to improve my..."
                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                          />
                          <input 
                            type="text"
                            value={journal321.i2}
                            onChange={(e) => setJournal321({...journal321, i2: e.target.value})}
                            placeholder="2. I'm working on..."
                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">1 Positive Affirmation</label>
                        <input 
                          type="text"
                          value={journal321.a1}
                          onChange={(e) => setJournal321({...journal321, a1: e.target.value})}
                          placeholder="I am worthy of..."
                          className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                        />
                      </div>

                      <button 
                        onClick={() => {
                          const { g1, g2, g3, i1, i2, a1 } = journal321;
                          if (g1 || g2 || g3 || i1 || i2 || a1) {
                            const formattedContent = `3/2/1 Method:\n\nGRATITUDE:\n- ${g1 || '...'}\n- ${g2 || '...'}\n- ${g3 || '...'}\n\nIMPROVEMENTS:\n- ${i1 || '...'}\n- ${i2 || '...'}\n\nAFFIRMATION:\n- ${a1 || '...'}`;
                            onAddGratitude(formattedContent);
                            setJournal321({ g1: '', g2: '', g3: '', i1: '', i2: '', a1: '' });
                          }
                        }}
                        className="w-full mt-4 px-6 py-4 bg-white text-purple-600 rounded-xl font-black text-base hover:scale-[1.02] hover:shadow-xl transition-all shadow-lg shadow-purple-950/30 flex items-center justify-center gap-2"
                      >
                        Log 3/2/1 Entry <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-white/20 to-transparent rounded-full blur-[80px] -mr-48 -mt-48" />
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-400/20 rounded-full blur-[60px] -ml-32 -mb-32" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      title: "Rewires your brain", 
                      desc: "Gratitude activates the prefrontal cortex, literally rebuilding neural pathways away from fear and scarcity.", 
                      icon: Brain, 
                      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100" 
                    },
                    { 
                      title: "Changes behavior", 
                      desc: "Daily financial gratitude leads to more intentional — not emotional — spending decisions.", 
                      icon: TrendingUp, 
                      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100" 
                    },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all group-hover:scale-110", card.color)}>
                        <card.icon size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight tracking-tight">{card.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed flex-1">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <MindsetCoach 
                  title="Abundance Coach"
                  subtitle="Explore the scarcity mindset and how to make the shift stick."
                  coachName="Abundance Coach"
                  coachDescription="I'm here to help you identify scarcity patterns and replace them with abundance-focused strategies."
                  suggestedQuestions={[
                    "How do I know if I have a scarcity mindset?",
                    "Why does gratitude help with wealth building?",
                    "I feel like there is never enough money — what do I do?",
                    "How long does it take to shift mindsets?",
                    "Daily practices for abundance?"
                  ]}
                  onSuggest={onSuggestAdvice}
                  icon={<Sparkles size={20} className="text-emerald-500" />}
                  className="h-full"
                />

                <div className="bg-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-900/20">
                  <div className="relative z-10">
                    <h4 className="text-lg font-bold mb-3">The Science in One Sentence</h4>
                    <p className="text-white text-xs leading-relaxed opacity-90">
                      Gratitude practice activates the brain's reward circuits, reduces cortisol, and statistically increases long-term saving behaviour.
                    </p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-12 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Your Gratitude Journal</h3>
                  <p className="text-sm text-slate-500">Document your daily wins and watch your abundance grow.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gratitudeEntries.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <Sparkles size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No entries yet. Start your abundance journey above.</p>
                  </div>
                ) : (
                  gratitudeEntries.sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
                    <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 group hover:border-emerald-500/20 hover:shadow-md transition-all relative">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform border border-emerald-100">
                        <Check size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-slate-900 font-bold leading-relaxed text-sm">{entry.content}</div>
                        <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <Calendar size={12} /> {entry.date}
                        </div>
                      </div>
                      <button 
                        onClick={() => onDeleteGratitude(entry.id)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'self-care' && (
          <motion.div 
            key="self-care"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Financial Self-Care</h2>
                <p className="text-sm text-slate-500 max-w-2xl">Rituals turn chores into meaningful practices. When you treat money management as self-care, you remove the shame.</p>
              </div>
              <button 
                onClick={() => setView('landing')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                <ChevronLeft size={16} /> Back to Practices
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
                <div className="bg-rose-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-rose-900/20 min-h-[400px] flex flex-col justify-center">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                      <Heart size={32} className="text-white" />
                    </div>
                    
                    <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-6">
                      <h3 className="text-xl font-black tracking-tighter uppercase">Self-Care Rituals</h3>
                    </div>

                    <p className="text-lg font-medium text-white leading-relaxed mb-10 max-w-lg">
                      Regular financial check-ins are the ultimate form of self-respect. Choose a ritual to log your progress today.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      {[
                        { type: 'review', title: 'Weekly Review', icon: RefreshCw },
                        { type: 'planning', title: 'Monthly Plan', icon: Calendar },
                        { type: 'celebration', title: 'Celebration', icon: Sparkles },
                        { type: 'organization', title: 'Organization', icon: CheckCircle2 },
                      ].map(ritual => (
                        <button 
                          key={ritual.type}
                          onClick={() => onAddRitual(ritual.type)}
                          className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all text-left flex flex-col items-center justify-center gap-3 group shadow-lg hover:scale-105"
                        >
                          <ritual.icon size={24} className="text-rose-200 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-black tracking-tight">{ritual.title}</span>
                        </button>
                      ))}
                      
                      <button 
                        onClick={() => setIsAddingCustomRitual(true)}
                        className="col-span-2 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group shadow-lg"
                      >
                        <Plus size={20} className="text-rose-200 group-hover:rotate-90 transition-transform" />
                        <span className="text-sm font-black tracking-tight">Add Custom Ritual</span>
                      </button>
                    </div>

                    {isAddingCustomRitual && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full">
                        <input 
                          type="text"
                          value={customRitual}
                          onChange={(e) => setCustomRitual(e.target.value)}
                          placeholder="Enter your custom ritual..."
                          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-base placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-all shadow-lg"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              if (customRitual.trim()) {
                                onAddRitual(customRitual);
                                setCustomRitual('');
                                setIsAddingCustomRitual(false);
                              }
                            }}
                            className="px-6 py-3 bg-white text-rose-600 rounded-xl font-black text-base hover:scale-105 transition-all shadow-lg"
                          >
                            Add
                          </button>
                          <button 
                            onClick={() => setIsAddingCustomRitual(false)}
                            className="px-4 py-3 bg-rose-900/20 text-white rounded-xl font-bold text-sm hover:bg-rose-900/40 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-white/30 to-transparent rounded-full blur-[80px] -mr-48 -mt-48 animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-400/30 rounded-full blur-[60px] -ml-32 -mb-32" />
                </div>
              </div>

              <MindsetCoach 
                title="Self-Care Coach"
                subtitle="Learn how to turn financial management into a restorative ritual."
                coachName="Self-Care Coach"
                coachDescription="I'm here to help you design financial rituals that feel like self-care rather than a burden."
                suggestedQuestions={[
                  "How can I make my weekly review less stressful?",
                  "What are some ways to celebrate financial wins?",
                  "How do I deal with the anxiety of opening my bank app?",
                  "What should be on my monthly planning checklist?",
                  "How can I involve my partner in these rituals?"
                ]}
                onSuggest={onSuggestAdvice}
                icon={<Heart size={20} className="text-rose-500" />}
                className="h-full"
              />
            </div>

            <div className="space-y-8 pt-12 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-100">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Rituals</h3>
                  <p className="text-sm text-slate-500">Your consistent actions building financial confidence.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rituals.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <Heart size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No rituals logged yet. Start your self-care today.</p>
                  </div>
                ) : (
                  rituals.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(ritual => (
                    <div key={ritual.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-500/20 hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-inner border border-rose-100">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900 capitalize tracking-tight truncate max-w-[120px]">{ritual.type}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{ritual.date}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDeleteRitual(ritual.id)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20"
                      >
                        <X size={14} />
                      </button>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest relative z-10 shadow-sm border border-emerald-100 hidden sm:block">Done</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-ink flex items-center justify-center shadow-inner border border-primary/10">
                    <Sparkles size={24} />
                  </div>
                  <h5 className="text-2xl font-bold text-slate-900 tracking-tight">The Power of Ritual</h5>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed max-w-5xl font-medium">
                  Rituals turn chores into meaningful practices. When you treat money management as self-care, 
                  you remove the shame and replace it with empowerment. Regular check-ins build the muscle of 
                  financial awareness, making it easier to stay aligned with your values.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
