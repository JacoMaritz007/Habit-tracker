import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface MindsetCoachProps {
  title: string;
  subtitle: string;
  coachName: string;
  coachDescription: string;
  suggestedQuestions: string[];
  onSuggest: (msg: string) => Promise<{ message: string }>;
  className?: string;
  icon?: React.ReactNode;
}

export const MindsetCoach = ({ 
  title, 
  subtitle, 
  coachName, 
  coachDescription, 
  suggestedQuestions, 
  onSuggest, 
  className,
  icon
}: MindsetCoachProps) => {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!msg.trim() || loading) return;
    
    setLoading(true);
    try {
      const res = await onSuggest(msg);
      setResponse(res.message);
      setMsg('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-bg shadow-sm border border-slate-100">
            {icon || <Sparkles size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[10px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full my-4" />

        <div className="p-4 bg-slate-50/80 backdrop-blur-md rounded-xl border border-slate-100 mb-6 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-brand-bg rounded flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
              {coachName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-900 tracking-tight">{coachName}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {coachDescription}
          </p>
        </div>
        
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {response ? (
            <div className="space-y-4">
              <div className="p-6 bg-brand-bg/5 rounded-2xl border border-brand-bg/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-bg/5 rounded-full -mr-12 -mt-12 blur-2xl transition-all group-hover:scale-110" />
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10 font-medium">
                  {response}
                </p>
              </div>
              <button 
                onClick={() => setResponse(null)}
                className="text-[10px] font-bold text-brand-bg hover:underline flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg/5 rounded-full transition-all"
              >
                <RefreshCw size={10} /> Ask another question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Try asking:</p>
              <div className="flex flex-col gap-2">
                {suggestedQuestions.map(q => (
                  <button 
                    key={q} 
                    onClick={() => setMsg(q)} 
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:border-brand-bg/40 hover:text-brand-bg hover:bg-brand-bg/5 transition-all text-left shadow-sm font-medium group flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-all text-brand-bg" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative mt-auto">
          <textarea 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything..."
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-bg/20 focus:border-brand-bg/30 outline-none resize-none transition-all pr-12 shadow-inner font-medium"
          />
          <button 
            type="submit"
            disabled={loading || !msg.trim()}
            className="absolute bottom-3 right-3 p-2 bg-brand-bg text-white rounded-lg hover:bg-brand-bg/90 transition-all disabled:opacity-50 shadow-lg shadow-brand-bg/20"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-slate-400">
          <span>Press</span>
          <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[8px] font-sans font-bold">Enter</kbd>
          <span>to send</span>
        </div>
      </div>
    </div>
  );
};
