import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Target, 
  BrainCircuit, 
  UserCircle, 
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
        "w-full flex items-center gap-3 px-3 h-10 rounded-xl transition-all duration-200 text-sm",
        active 
          ? "bg-primary-soft text-primary-ink font-semibold" 
          : "text-slate-600 font-medium hover:bg-slate-100 hover:text-ink"
      )}
    >
      <Icon size={18} className={active ? "text-primary-ink" : "text-slate-400"} />
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
                  ? "text-primary-ink font-bold" 
                  : "text-slate-500 hover:text-ink"
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
        <div className="flex flex-col gap-1.5">
          <h1>
            <img src="/brand/wealthos-logo-black.png" alt="WealthOS" className="h-5 w-auto" />
          </h1>
          <p className="wh-label !text-[10px]">Wealth Habits</p>
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
        <div className="brand-gradient rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-1">Need Help?</h3>
          <p className="text-xs text-white/70 mb-3">Our support team is here to assist you with any questions.</p>
          <button className="wh-btn wh-btn--primary wh-btn--sm wh-btn--block">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
};
