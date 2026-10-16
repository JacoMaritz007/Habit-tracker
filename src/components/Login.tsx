import React, { useState } from 'react';
import { LogIn, Mail, Lock, UserPlus, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen brand-gradient flex flex-col items-center justify-center gap-8 p-4 relative overflow-hidden">
      <img src="/brand/wealthos-logo-white.png" alt="WealthOS — Wealth Operating System" className="w-64 sm:w-80 h-auto relative z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative z-10"
      >
        <img src="/brand/wealthos-icon.png" alt="" className="w-16 h-16 mx-auto mb-6 rounded-2xl shadow-xl" />
        
        <h1 className="text-3xl font-black text-ink tracking-tight mb-2">Wealth Habits</h1>
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
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-ink focus:ring-3 focus:ring-focus/30 focus:border-focus outline-none transition-all"
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
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-ink focus:ring-3 focus:ring-focus/30 focus:border-focus outline-none transition-all"
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
            className="w-full h-13 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_8px_22px_rgba(244,124,32,.32)] disabled:opacity-50 disabled:transform-none"
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
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-slate-400 font-bold tracking-widest">Or continue with</span></div>
        </div>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full h-13 bg-white border border-slate-200 text-ink rounded-full font-semibold hover:border-ink transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-6 text-sm font-semibold text-focus hover:text-blue-700 transition-colors"
        >
          {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-primary" />
            Secure Financial Mastery
          </p>
        </div>
      </motion.div>
    </div>
  );
};
