import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Target, 
  BrainCircuit, 
  UserCircle, 
  Wallet,
  ChevronRight,
  Calculator,
  X,
  Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ProgressIndicator } from './ProgressIndicator';

const SidebarItem = ({ icon: Icon, label, active, onClick, subItems, activeTab }: any) => (
  <div className="mb-1">
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
        active 
          ? "bg-brand-bg/10 text-brand-bg" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon size={18} className={active ? "text-brand-bg" : "text-slate-400"} />
      <span className="flex-1 text-left">{label}</span>
      {subItems && <ChevronRight size={14} className={cn("transition-transform", active && "rotate-90")} />}
    </button>
    {active && subItems && (
      <div className="ml-9 mt-1 space-y-1">
        {subItems.map((item: any) => {
          const isSubActive = activeTab === `mindset-${item.id}`;
          return (
            <button
              key={item.id}
              onClick={() => item.onClick()}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs transition-colors",
                isSubActive 
                  ? "text-brand-bg font-bold" 
                  : "text-slate-500 hover:text-brand-bg"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export const Sidebar = ({ activeTab, setActiveTab, onClose, userProfile }: { activeTab: string, setActiveTab: (t: string) => void, onClose?: () => void, userProfile?: any }) => {
  return (
    <aside className="w-full h-full border-r border-slate-200 bg-white flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-bg rounded-lg flex items-center justify-center">
            <Wallet className="text-white" size={18} />
          </div>
          <h1 className="font-bold text-lg text-brand-bg tracking-tight">Wealth Habits</h1>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="px-4 py-4 border-b border-slate-100">
        <ProgressIndicator xp={userProfile?.xp || 0} compact />
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          activeTab={activeTab}
        />
        <SidebarItem 
          icon={CheckCircle2} 
          label="Habits" 
          active={activeTab === 'habits'} 
          onClick={() => setActiveTab('habits')} 
          activeTab={activeTab}
        />
        <SidebarItem 
          icon={Target} 
          label="Goals" 
          active={activeTab === 'goals'} 
          onClick={() => setActiveTab('goals')} 
          activeTab={activeTab}
        />
        <SidebarItem 
          icon={Calculator} 
          label="Freedom Calculator" 
          active={activeTab === 'freedom-calculator'} 
          onClick={() => setActiveTab('freedom-calculator')} 
          activeTab={activeTab}
        />
        <SidebarItem 
          icon={BrainCircuit} 
          label="Mindset Money" 
          active={activeTab.startsWith('mindset')} 
          onClick={() => setActiveTab('mindset')}
          activeTab={activeTab}
          subItems={[
            { id: 'enneagram', label: 'Wealth Enneagram', onClick: () => setActiveTab('mindset-enneagram') },
            { id: 'story', label: 'Money Story', onClick: () => setActiveTab('mindset-story') },
            { id: 'gratitude', label: 'Scarcity to Abundance', onClick: () => setActiveTab('mindset-gratitude') },
            { id: 'self-care', label: 'Financial Self-Care', onClick: () => setActiveTab('mindset-self-care') },
          ]}
        />
        <SidebarItem 
          icon={UserCircle} 
          label="Account" 
          active={activeTab === 'account'} 
          onClick={() => setActiveTab('account')} 
          activeTab={activeTab}
        />
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-brand-accent/10 rounded-xl p-4 border border-brand-accent/20">
          <h3 className="text-sm font-bold text-brand-bg mb-1">Need Help?</h3>
          <p className="text-xs text-slate-600 mb-3">Our support team is here to assist you with any questions.</p>
          <button className="w-full py-2 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded-lg transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
};
