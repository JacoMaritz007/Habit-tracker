import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Coins, 
  Settings, 
  Camera, 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User as FirebaseUser } from 'firebase/auth';
import { analyzeProfilePhoto } from '../services/geminiService';

interface AccountProps {
  user: FirebaseUser | null;
  userProfile: any;
  updateUserProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  onBack: () => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const incomeRanges = [
  'Select a range',
  '$0 - $2,500',
  '$2,501 - $5,000',
  '$5,001 - $10,000',
  '$10,001 - $20,000',
  '$20,001 - $50,000',
  '$50,000+',
];

const wealthChallenges = [
  'Select your challenge',
  'Debt Management',
  'Inconsistent Income',
  'Overspending',
  'Lack of Investment Knowledge',
  'Fear of Risk',
  'Scarcity Mindset',
];

const enneagramTypes = [
  'Select your type',
  'Type 1: The Perfectionist',
  'Type 2: The Helper',
  'Type 3: The Achiever',
  'Type 4: The Individualist',
  'Type 5: The Investigator',
  'Type 6: The Loyalist',
  'Type 7: The Enthusiast',
  'Type 8: The Challenger',
  'Type 9: The Peacemaker',
];

export const Account: React.FC<AccountProps> = ({ user, userProfile, updateUserProfile, logout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'wealth' | 'security' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(userProfile?.photoAnalysis || null);

  // Form states
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [incomeRange, setIncomeRange] = useState(userProfile?.incomeRange || 'Select a range');
  const [primaryGoal, setPrimaryGoal] = useState(userProfile?.primaryGoal || '');
  const [wealthChallenge, setWealthChallenge] = useState(userProfile?.wealthChallenge || 'Select your challenge');
  const [enneagramType, setEnneagramType] = useState(userProfile?.enneagramType || 'Select your type');
  const [currency, setCurrency] = useState(userProfile?.currency || 'USD');

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateUserProfile({
        displayName,
        bio,
        incomeRange,
        primaryGoal,
        wealthChallenge,
        enneagramType,
        currency,
        ...(analysisResult ? { photoAnalysis: analysisResult } : {}),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const result = await analyzeProfilePhoto(base64String, file.type);
        setAnalysisResult(result);
        // Auto-save just the analysis; spreading the cached profile could
        // overwrite newer XP or badges.
        await updateUserProfile({ photoAnalysis: result });
      } catch (error) {
        console.error('Error analyzing photo:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500">Manage your profile, wealth info, and security.</p>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-3xl font-bold">
                {displayName.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-primary-ink transition-colors cursor-pointer">
            <Camera size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <h2 className="text-xl font-bold text-slate-900">{displayName || 'Wealth Builder'}</h2>
            {analysisResult?.persona && (
              <div className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded text-[10px] font-bold uppercase tracking-wider">
                {analysisResult.persona}
              </div>
            )}
          </div>
          <p className="text-slate-500 text-sm mb-2">{user?.email}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <Mail size={12} />
            Email account
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
            <Settings size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
          <button 
            onClick={logout}
            className="px-6 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-bold transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'profile' ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <User size={18} /> Profile
        </button>
        <button
          onClick={() => setActiveTab('wealth')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'wealth' ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Coins size={18} /> Wealth Info
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'security' ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Shield size={18} /> Security
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'preferences' ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Globe size={18} /> Preferences
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <User size={20} className="text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Profile</h3>
                </div>
                <p className="text-sm text-slate-500">Your name and bio shown across the app.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="A short description about yourself and your wealth goals..."
                    />
                    <p className="text-[10px] text-slate-400 mt-2">This helps personalise your experience.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-brand-accent/10 rounded-lg">
                    <Sparkles size={20} className="text-brand-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">AI Photo Analysis</h3>
                </div>
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-4">
                    <Loader2 className="w-8 h-8 text-ink animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Analyzing your wealth persona...</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <h4 className="text-sm font-bold text-ink uppercase tracking-widest mb-2">Wealth Persona</h4>
                      <p className="text-xl font-bold text-slate-900 mb-3">{analysisResult.persona}</p>
                      <p className="text-sm text-slate-600 leading-relaxed italic">"{analysisResult.analysis}"</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Brand Tips</h4>
                      {analysisResult.tips.map((tip: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-xs text-slate-600">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <Camera className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-sm text-slate-500 font-medium mb-4">Upload a photo to get an AI analysis of your personal wealth brand.</p>
                    <label className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary-hover transition-all cursor-pointer">
                      Upload Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wealth' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Coins size={20} className="text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Wealth Profile</h3>
              </div>
              <p className="text-sm text-slate-500">Used to personalise your AI habit suggestions and advice. The more you share, the better your recommendations.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Income Range</label>
                  <select
                    value={incomeRange}
                    onChange={(e) => setIncomeRange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    {incomeRanges.map(range => <option key={range} value={range}>{range}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Wealth Goal</label>
                  <textarea
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="e.g. Build a 6-month emergency fund, pay off debt, invest $500/month..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biggest Wealth Challenge</label>
                  <select
                    value={wealthChallenge}
                    onChange={(e) => setWealthChallenge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    {wealthChallenges.map(challenge => <option key={challenge} value={challenge}>{challenge}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enneagram Money Type</label>
                  <select
                    value={enneagramType}
                    onChange={(e) => setEnneagramType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    {enneagramTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Don't know yours? <button type="button" className="text-ink hover:underline">Take the Wealth Enneagram Test</button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Lock size={20} className="text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                </div>
                <p className="text-sm text-slate-500">You'll need your current password to update it.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                    <input type="password" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm cursor-not-allowed" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                      <input type="password" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm cursor-not-allowed" placeholder="Min. 6 characters" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input type="password" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm cursor-not-allowed" />
                    </div>
                  </div>
                  <button type="button" disabled className="px-6 py-2.5 bg-slate-200 text-slate-500 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed">
                    <Lock size={16} /> Update Password
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Mail size={20} className="text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Change Email</h3>
                </div>
                <p className="text-sm text-slate-500">Current: <span className="font-bold text-slate-700">{user?.email}</span></p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Email Address</label>
                    <input type="email" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm cursor-not-allowed" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm with Current Password</label>
                    <input type="password" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm cursor-not-allowed" />
                  </div>
                  <button type="button" disabled className="px-6 py-2.5 bg-slate-200 text-slate-500 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed">
                    <Mail size={16} /> Update Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Globe size={20} className="text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Preferences</h3>
              </div>
              <p className="text-sm text-slate-500">Customise how the app looks and feels for you.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">App Currency</label>
                  <p className="text-xs text-slate-400 mb-3">This will change the currency symbol used throughout the application.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currencies.map((curr) => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => setCurrency(curr.code)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all text-left",
                          currency === curr.code 
                            ? "border-primary bg-primary/5" 
                            : "border-slate-100 hover:border-slate-200 bg-slate-50"
                        )}
                      >
                        <div className="text-lg font-bold text-slate-900">{curr.symbol}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{curr.code}</div>
                        <div className="text-[10px] text-slate-400 truncate">{curr.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {activeTab !== 'security' && (
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 size={14} />
                    Changes saved successfully!
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle2 size={20} />
                )}
                Save {activeTab === 'profile' ? 'Profile' : activeTab === 'wealth' ? 'Wealth Info' : 'Preferences'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-rose-600" size={24} />
          <h3 className="text-lg font-bold text-rose-900">Danger Zone</h3>
        </div>
        <p className="text-sm text-rose-700">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20">
          Delete Account
        </button>
      </div>
    </div>
  );
};
