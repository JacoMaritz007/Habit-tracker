import React, { useState } from 'react';
import { Wallet, LogIn, Mail, Lock, UserPlus, Sparkles } from 'lucide-react';
import { signInWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/20 text-center relative z-10"
      >
        <div className="w-16 h-16 bg-brand-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-bg/20 border border-white/10">
          <Wallet className="text-white" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-brand-bg mb-2 tracking-tight">Wealth Habits</h1>
        <p className="text-slate-600 mb-8 leading-relaxed text-sm font-medium">
          The high-ticket coaching platform for financial mastery and mindset transformation.
        </p>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-bg focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-bg focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50/80 p-3 rounded-xl border border-rose-100 backdrop-blur-sm">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-bg text-white rounded-2xl font-bold hover:bg-brand-bg/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-brand-bg/20 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                {isRegistering ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white/50 backdrop-blur-sm px-3 text-slate-400 font-bold tracking-widest">Or continue with</span></div>
        </div>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full py-4 bg-white/80 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-6 text-sm font-bold text-brand-bg hover:text-brand-accent transition-colors"
        >
          {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-brand-accent" />
            Secure Financial Mastery
          </p>
        </div>
      </motion.div>
    </div>
  );
};
