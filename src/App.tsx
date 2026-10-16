import React, { useState, useEffect } from 'react';
import { Bell, LogOut, MessageSquare, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, logout, handleFirestoreError, OperationType } from './firebase';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Habits } from './components/Habits';
import { Goals } from './components/Goals';
import { Mindset } from './components/Mindset';
import { Account } from './components/Account';
import { FreedomCalculator } from './components/FreedomCalculator';
import { Login } from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TransactionModal } from './components/TransactionModal';
import { HabitModal } from './components/HabitModal';
import { GoalModal } from './components/GoalModal';
import { ChatDrawer } from './components/ChatDrawer';
import { cn } from './lib/utils';
import { 
  Transaction, 
  Habit, 
  Goal, 
  GratitudeEntry, 
  RitualEntry,
  MoneyStoryResponse,
  FreedomCalculatorData,
  XP_REWARDS,
  UserProfile
} from './types';
import { getFinancialInsights, getHabitSuggestions, getEnneagramAdvice, getGoalBrainstorming, getMoneyStoryAdvice } from './services/geminiService';
import { calculateLevel, checkForNewBadges } from './lib/progress';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [rituals, setRituals] = useState<RitualEntry[]>([]);
  const [moneyStoryResponses, setMoneyStoryResponses] = useState<MoneyStoryResponse[]>([]);
  const [freedomCalculatorData, setFreedomCalculatorData] = useState<FreedomCalculatorData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Ensure user document exists
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'user',
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    const qTransactions = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));

    const qHabits = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsubscribeHabits = onSnapshot(qHabits, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'habits'));

    const qGoals = query(collection(db, 'goals'), where('userId', '==', user.uid));
    const unsubscribeGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'goals'));

    const qGratitude = query(collection(db, 'gratitude_entries'), where('userId', '==', user.uid));
    const unsubscribeGratitude = onSnapshot(qGratitude, (snapshot) => {
      setGratitudeEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GratitudeEntry)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'gratitude_entries'));

    const qRituals = query(collection(db, 'rituals'), where('userId', '==', user.uid));
    const unsubscribeRituals = onSnapshot(qRituals, (snapshot) => {
      setRituals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RitualEntry)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'rituals'));

    const qMoneyStory = query(collection(db, 'money_story_responses'), where('userId', '==', user.uid));
    const unsubscribeMoneyStory = onSnapshot(qMoneyStory, (snapshot) => {
      setMoneyStoryResponses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoneyStoryResponse)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'money_story_responses'));

    const unsubscribeFreedom = onSnapshot(doc(db, 'freedom_calculator', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setFreedomCalculatorData({ id: snapshot.id, ...snapshot.data() } as FreedomCalculatorData);
      } else {
        setFreedomCalculatorData(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `freedom_calculator/${user.uid}`));

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
      unsubscribeHabits();
      unsubscribeGoals();
      unsubscribeGratitude();
      unsubscribeRituals();
      unsubscribeMoneyStory();
      unsubscribeFreedom();
    };
  }, [user, isAuthReady]);

  // AI Insights
  useEffect(() => {
    if (transactions.length > 0 || goals.length > 0) {
      const fetchInsights = async () => {
        setIsAiLoading(true);
        try {
          const res = await getFinancialInsights({ transactions, goals });
          setInsights(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsAiLoading(false);
        }
      };
      fetchInsights();
    }
  }, [transactions, goals]);

  const toggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit || !user) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompleted = habit.completedDays.includes(today);
    const newDays = isCompleted 
      ? habit.completedDays.filter(d => d !== today)
      : [...habit.completedDays, today];
    
    try {
      await setDoc(doc(db, 'habits', id), {
        completedDays: newDays,
        streak: isCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1
      }, { merge: true });
      
      if (!isCompleted) {
        awardXP(XP_REWARDS.HABIT_COMPLETE, 'completing a habit');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `habits/${id}`);
    }
  };

  const addTransactions = async (data: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => {
    if (!user) return;
    const dataArray = Array.isArray(data) ? data : [data];
    try {
      const promises = dataArray.map(item => 
        addDoc(collection(db, 'transactions'), {
          ...item,
          userId: user.uid,
          createdAt: serverTimestamp()
        })
      );
      await Promise.all(promises);
      awardXP(XP_REWARDS.TRANSACTION_LOG * dataArray.length, `logging ${dataArray.length} transactions`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const addHabit = async (data: Omit<Habit, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'habits'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      awardXP(XP_REWARDS.HABIT_CREATE, 'creating a new habit');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'habits');
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'habits', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `habits/${id}`);
    }
  };

  const addGoal = async (data: Omit<Goal, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'goals'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      awardXP(XP_REWARDS.GOAL_SET, 'setting a new goal');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'goals');
    }
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    if (!user) return;
    try {
      const goal = goals.find(g => g.id === id);
      const isNowComplete = data.currentAmount !== undefined && goal && data.currentAmount >= goal.targetAmount;
      const wasComplete = goal && goal.currentAmount >= goal.targetAmount;

      await setDoc(doc(db, 'goals', id), data, { merge: true });
      
      if (isNowComplete && !wasComplete) {
        awardXP(XP_REWARDS.GOAL_COMPLETE, 'achieving a goal');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
    }
  };

  const addGratitudeEntry = async (content: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'gratitude_entries'), {
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        content,
        createdAt: serverTimestamp()
      });
      awardXP(XP_REWARDS.GRATITUDE_ENTRY, 'logging gratitude');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gratitude_entries');
    }
  };

  const deleteGratitudeEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gratitude_entries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gratitude_entries/${id}`);
    }
  };

  const addRitual = async (type: RitualEntry['type'] | string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'rituals'), {
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        type,
        createdAt: serverTimestamp()
      });
      awardXP(XP_REWARDS.RITUAL_LOG, 'logging a ritual');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rituals');
    }
  };

  const deleteRitual = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'rituals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rituals/${id}`);
    }
  };

  const saveMoneyStoryResponse = async (questionId: number, answer: string) => {
    if (!user) return;
    try {
      const existing = moneyStoryResponses.find(r => r.questionId === questionId);
      if (existing) {
        await setDoc(doc(db, 'money_story_responses', existing.id), {
          userId: user.uid,
          questionId,
          answer,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'money_story_responses'), {
          userId: user.uid,
          questionId,
          answer,
          updatedAt: serverTimestamp()
        });
        awardXP(XP_REWARDS.MONEY_STORY_ANSWER, 'answering a money story question');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'money_story_responses');
    }
  };

  const saveFreedomCalculator = async (data: Partial<FreedomCalculatorData>) => {
    if (!user) return;
    try {
      // Use user.uid as the document ID for a 1-to-1 relationship
      await setDoc(doc(db, 'freedom_calculator', user.uid), {
        ...data,
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      if (!freedomCalculatorData) {
        awardXP(XP_REWARDS.FREEDOM_CALC_SAVE, 'mapping your freedom path');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `freedom_calculator/${user.uid}`);
    }
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    try {
      const wasEnneagramSet = !!userProfile?.enneagramType && userProfile.enneagramType !== 'Select your type';
      const isEnneagramSetting = !!data.enneagramType && data.enneagramType !== 'Select your type';
      
      const wasPhotoAnalyzed = !!userProfile?.photoAnalysis;
      const isPhotoAnalyzing = !!data.photoAnalysis;

      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      
      if (isEnneagramSetting && !wasEnneagramSet) {
        awardXP(50, 'discovering your enneagram type');
      }
      if (isPhotoAnalyzing && !wasPhotoAnalyzed) {
        awardXP(XP_REWARDS.PHOTO_ANALYSIS, 'analyzing your wealth persona photo');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const awardXP = async (amount: number, reason?: string) => {
    if (!user || !userProfile) return;
    
    const newXP = (userProfile.xp || 0) + amount;
    const oldLevel = calculateLevel(userProfile.xp || 0);
    const newLevel = calculateLevel(newXP);
    
    const updateData: any = { xp: newXP };
    if (newLevel > oldLevel) {
      updateData.level = newLevel;
      // Level up logic could go here (notifications etc)
      console.log(`Level Up! You are now level ${newLevel}`);
    }
    
    await updateUserProfile(updateData);
    if (reason) {
      console.log(`Awarded ${amount} XP for ${reason}`);
    }
  };

  // Badge Watcher
  useEffect(() => {
    if (!user || !userProfile || !habits.length) return;
    
    const context = {
      habits,
      transactions,
      goals,
      moneyStoryResponses,
      gratitudeEntries
    };
    
    const newBadgeIds = checkForNewBadges(userProfile, context);
    if (newBadgeIds.length > 0) {
      const currentBadges = userProfile.badges || [];
      updateUserProfile({
        badges: [...currentBadges, ...newBadgeIds]
      });
      console.log(`Unlocked Badges: ${newBadgeIds.join(', ')}`);
    }
  }, [user, habits, transactions, goals, moneyStoryResponses, gratitudeEntries]);

  const handleSuggestHabits = async (msg: string) => {
    try {
      const suggestions = await getHabitSuggestions(msg);
      return suggestions;
    } catch (e) {
      console.error(e);
      return { message: "I'm sorry, I couldn't generate suggestions right now.", habits: [] };
    }
  };

  const handleSuggestAdvice = async (msg: string) => {
    try {
      const type = userProfile?.enneagramType ? `Type ${userProfile.enneagramType}` : 'Unknown Type';
      const advice = await getEnneagramAdvice(type, msg);
      return { message: advice, habits: [] };
    } catch (e) {
      console.error(e);
      return { message: "I'm sorry, I couldn't generate advice right now.", habits: [] };
    }
  };

  const handleSuggestMoneyStoryAdvice = async (msg: string) => {
    try {
      const story = moneyStoryResponses.map(r => `Q: ${r.questionId}, A: ${r.answer}`).join('\n');
      const advice = await getMoneyStoryAdvice(story, msg);
      return { message: advice };
    } catch (e) {
      console.error(e);
      return { message: "I'm sorry, I couldn't generate advice right now." };
    }
  };

  const handleSuggestGoals = async (msg: string) => {
    try {
      const suggestions = await getGoalBrainstorming(msg);
      return suggestions;
    } catch (e) {
      console.error(e);
      return { message: "I'm sorry, I couldn't generate suggestions right now.", habits: [] };
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }} 
            onClose={() => setIsSidebarOpen(false)}
            userProfile={userProfile}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-500 hover:text-primary-ink lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 capitalize truncate">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-2 text-slate-400 hover:text-primary-ink transition-colors relative group"
                title="AI Wealth Coach"
              >
                <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white animate-pulse"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <Dashboard 
                    transactions={transactions} 
                    goals={goals} 
                    insights={insights} 
                    isAiLoading={isAiLoading} 
                    onAddTransaction={() => setIsTransactionModalOpen(true)}
                    onDeleteTransaction={deleteTransaction}
                    currency={userProfile?.currency}
                    userProfile={userProfile}
                  />
                </motion.div>
              )}
              {activeTab === 'habits' && (
                <motion.div 
                  key="habits"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <Habits 
                    habits={habits} 
                    toggleHabit={toggleHabit} 
                    onSuggestHabits={handleSuggestHabits} 
                    onAddHabit={() => setIsHabitModalOpen(true)}
                    onAddHabitDirect={(habit) => addHabit({ ...habit, streak: 0, completedDays: [] })}
                    onDeleteHabit={deleteHabit}
                  />
                </motion.div>
              )}
              {activeTab === 'goals' && (
                <motion.div 
                  key="goals"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <Goals 
                    goals={goals} 
                    onAddGoal={() => {
                      setSelectedGoal(null);
                      setIsGoalModalOpen(true);
                    }}
                    onEditGoal={(goal) => {
                      setSelectedGoal(goal);
                      setIsGoalModalOpen(true);
                    }}
                    onAddGoalDirect={(goal) => {
                      // Sanitize goal data to match Firestore security rules
                      const sanitizedGoal = {
                        title: String(goal.title || 'New Goal'),
                        targetAmount: Number(goal.targetAmount) || 1000,
                        currentAmount: 0,
                        deadline: String(goal.deadline || '2026-12-31'),
                        category: (['1-year', '3-year', '5-year'].includes(goal.category) ? goal.category : '1-year') as any,
                        obstacles: goal.obstacles || '',
                        partners: goal.partners || '',
                        knowledge: goal.knowledge || '',
                        plan: goal.plan || '',
                        why: goal.why || ''
                      };
                      addGoal(sanitizedGoal);
                    }}
                    onDeleteGoal={deleteGoal}
                    onSuggestGoals={handleSuggestGoals}
                    currency={userProfile?.currency}
                  />
                </motion.div>
              )}
              {activeTab === 'freedom-calculator' && (
                <motion.div 
                  key="freedom-calculator"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <FreedomCalculator 
                    data={freedomCalculatorData}
                    onSave={saveFreedomCalculator}
                    globalCurrency={userProfile?.currency}
                  />
                </motion.div>
              )}
              {activeTab.startsWith('mindset') && (
                <motion.div 
                  key="mindset"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <Mindset 
                    userProfile={userProfile}
                    gratitudeEntries={gratitudeEntries}
                    rituals={rituals}
                    moneyStoryResponses={moneyStoryResponses}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    updateUserProfile={updateUserProfile}
                    onAddGratitude={addGratitudeEntry}
                    onDeleteGratitude={deleteGratitudeEntry}
                    onAddRitual={addRitual}
                    onDeleteRitual={deleteRitual}
                    onSaveMoneyStoryResponse={saveMoneyStoryResponse}
                    onSuggestAdvice={handleSuggestAdvice}
                    onSuggestMoneyStoryAdvice={handleSuggestMoneyStoryAdvice}
                  />
                </motion.div>
              )}
              {activeTab === 'account' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <Account 
                    user={user}
                    userProfile={userProfile}
                    updateUserProfile={updateUserProfile}
                    logout={logout}
                    onBack={() => setActiveTab('dashboard')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        onAdd={addTransactions}
      />
      <HabitModal 
        isOpen={isHabitModalOpen} 
        onClose={() => setIsHabitModalOpen(false)} 
        onAdd={addHabit}
      />
      <GoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoal(null);
        }} 
        onAdd={addGoal}
        onUpdate={updateGoal}
        goal={selectedGoal || undefined}
      />
      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={user}
      />
    </ErrorBoundary>
  );
}
