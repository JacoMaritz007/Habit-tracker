import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getCountFromServer, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import Papa from 'papaparse';
import {
  Users, UserPlus, CheckCircle2, Target, Receipt, Search, Download, RefreshCw,
  ShieldCheck, Shield, Flame, Mail, CalendarDays,
} from 'lucide-react';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { calculateLevel } from '../lib/progress';
import { Modal } from './Modal';
import type { Goal, Habit } from '../types';

type AdminUser = {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  xp?: number;
  badges?: string[];
  enneagramType?: string | number;
  currency?: string;
  primaryGoal?: string;
  wealthChallenge?: string;
  incomeRange?: string;
  createdAt?: { toDate: () => Date };
};

type Totals = { habits: number; goals: number; transactions: number };

const toDate = (u: AdminUser) => u.createdAt?.toDate?.() ?? null;
const hasValue = (v?: string | number) => v !== undefined && v !== '' && !String(v).startsWith('Select');

const StatTile = ({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: any; tone: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', tone)}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-3xl font-black text-ink tabular-nums">{value}</p>
  </div>
);

export const Admin = ({ currentUid }: { currentUid: string }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [userSnap, habits, goals, transactions] = await Promise.all([
        getDocs(collection(db, 'users')),
        getCountFromServer(collection(db, 'habits')),
        getCountFromServer(collection(db, 'goals')),
        getCountFromServer(collection(db, 'transactions')),
      ]);
      setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser)));
      setTotals({ habits: habits.data().count, goals: goals.data().count, transactions: transactions.data().count });
    } catch (e: any) {
      console.error(e);
      setError(e?.code === 'permission-denied'
        ? "Your account doesn't have admin access in the database. Sign in with Google as an admin."
        : 'Could not load admin data. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter(u => !q || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q))
      .sort((a, b) => (toDate(b)?.getTime() ?? 0) - (toDate(a)?.getTime() ?? 0));
  }, [users, search]);

  const weekAgo = subDays(new Date(), 7);
  const newThisWeek = users.filter(u => (toDate(u) ?? new Date(0)) >= weekAgo).length;

  const setRole = async (u: AdminUser, role: 'user' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', u.id), { role });
      setUsers(prev => prev.map(p => (p.id === u.id ? { ...p, role } : p)));
      setSelected(prev => (prev?.id === u.id ? { ...prev, role } : prev));
    } catch (e) {
      console.error(e);
      setError(`Couldn't change the role for ${u.email || u.id}.`);
    }
  };

  const exportCsv = () => {
    const rows = sorted.map(u => ({
      name: u.displayName ?? '',
      email: u.email ?? '',
      role: u.role ?? 'user',
      joined: toDate(u) ? format(toDate(u)!, 'yyyy-MM-dd') : '',
      level: calculateLevel(u.xp || 0),
      xp: u.xp || 0,
      badges: (u.badges || []).length,
      enneagram: hasValue(u.enneagramType) ? u.enneagramType : '',
      primaryGoal: hasValue(u.primaryGoal) ? u.primaryGoal : '',
      wealthChallenge: hasValue(u.wealthChallenge) ? u.wealthChallenge : '',
      incomeRange: hasValue(u.incomeRange) ? u.incomeRange : '',
    }));
    const blob = new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wealth-habits-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="wh-eyebrow mb-2">Admin</p>
          <h1 className="text-3xl font-black text-ink tracking-tight">Members overview</h1>
          <p className="text-slate-500 mt-1">Everyone using Wealth Habits, and how they're progressing.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 rounded-full border border-slate-200 bg-white text-sm font-semibold text-ink hover:border-ink transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-medium text-rose-700">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile label="Members" value={loading ? '–' : users.length} icon={Users} tone="bg-primary-soft text-primary-ink" />
        <StatTile label="New (7 days)" value={loading ? '–' : newThisWeek} icon={UserPlus} tone="bg-blue-50 text-blue-600" />
        <StatTile label="Habits" value={totals?.habits ?? '–'} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
        <StatTile label="Goals" value={totals?.goals ?? '–'} icon={Target} tone="bg-amber-50 text-amber-600" />
        <StatTile label="Transactions" value={totals?.transactions ?? '–'} icon={Receipt} tone="bg-slate-100 text-slate-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-ink">Members</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email"
                className="h-10 w-full sm:w-64 pl-9 pr-3 rounded-xl border border-slate-200 text-sm text-ink focus:outline-none focus:border-focus focus:ring-3 focus:ring-focus/30"
              />
            </div>
            <button
              onClick={exportCsv}
              disabled={!sorted.length}
              className="flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="wh-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Joined</th>
                <th className="is-num">Level</th>
                <th className="is-num">XP</th>
                <th>Enneagram</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(u => (
                <tr key={u.id} className="cursor-pointer" onClick={() => setSelected(u)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="wh-avatar wh-avatar--sm">{(u.displayName || u.email || '?').charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{u.displayName || '—'}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-slate-600">{toDate(u) ? format(toDate(u)!, 'd MMM yyyy') : '—'}</td>
                  <td className="is-num font-semibold">{calculateLevel(u.xp || 0)}</td>
                  <td className="is-num">{u.xp || 0}</td>
                  <td>{hasValue(u.enneagramType) ? `Type ${u.enneagramType}` : <span className="text-slate-400">—</span>}</td>
                  <td>
                    {u.role === 'admin'
                      ? <span className="wh-chip wh-chip--orange">Admin</span>
                      : <span className="wh-chip">Member</span>}
                  </td>
                </tr>
              ))}
              {!loading && !sorted.length && (
                <tr><td colSpan={6} className="text-center text-slate-500 py-10">{search ? 'No members match that search.' : 'No members yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetail user={selected} currentUid={currentUid} onClose={() => setSelected(null)} onSetRole={setRole} />
    </div>
  );
};

const UserDetail = ({ user, currentUid, onClose, onSetRole }: {
  user: AdminUser | null;
  currentUid: string;
  onClose: () => void;
  onSetRole: (u: AdminUser, role: 'user' | 'admin') => Promise<void>;
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    const mine = (name: string) => query(collection(db, name), where('userId', '==', user.id));
    Promise.all([getDocs(mine('habits')), getDocs(mine('goals')), getCountFromServer(mine('transactions'))])
      .then(([h, g, t]) => {
        if (cancelled) return;
        setHabits(h.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
        setGoals(g.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
        setTxCount(t.data().count);
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user) return null;
  const isSelf = user.id === currentUid;
  const isAdmin = user.role === 'admin';
  const joined = toDate(user);
  const facts: [string, string | number | undefined][] = [
    ['Primary goal', user.primaryGoal],
    ['Wealth challenge', user.wealthChallenge],
    ['Income range', user.incomeRange],
    ['Enneagram', hasValue(user.enneagramType) ? `Type ${user.enneagramType}` : undefined],
    ['Currency', user.currency],
  ];

  const toggleRole = async () => {
    setSaving(true);
    await onSetRole(user, isAdmin ? 'user' : 'admin');
    setSaving(false);
  };

  return (
    <Modal isOpen={!!user} onClose={onClose} title={user.displayName || user.email || 'Member'} size="xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-1.5"><Mail size={15} className="text-slate-400" />{user.email || '—'}</span>
          <span className="flex items-center gap-1.5"><CalendarDays size={15} className="text-slate-400" />Joined {joined ? format(joined, 'd MMM yyyy') : '—'}</span>
          {isAdmin ? <span className="wh-chip wh-chip--orange">Admin</span> : <span className="wh-chip">Member</span>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[['Level', calculateLevel(user.xp || 0)], ['XP', user.xp || 0], ['Badges', (user.badges || []).length]].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-ink tabular-nums mt-1">{value}</p>
            </div>
          ))}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</dt>
              <dd className="text-sm text-ink mt-0.5">{hasValue(value) ? value : <span className="text-slate-400">Not set</span>}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h4 className="text-sm font-bold text-ink mb-2">Habits ({loading ? '…' : habits.length})</h4>
          {!loading && !habits.length && <p className="text-sm text-slate-500">No habits yet.</p>}
          <ul className="wh-list">
            {habits.map(h => (
              <li key={h.id}>
                <span className="flex-1 text-sm text-ink">{h.title}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary-ink"><Flame size={14} />{h.streak || 0}-day streak</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink mb-2">Goals ({loading ? '…' : goals.length})</h4>
          {!loading && !goals.length && <p className="text-sm text-slate-500">No goals yet.</p>}
          <div className="space-y-3">
            {goals.map(g => {
              const pct = g.targetAmount ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink font-medium">{g.title}</span>
                    <span className="text-slate-500 tabular-nums">{pct}%</span>
                  </div>
                  <div className="wh-progress"><div className="wh-progress__bar" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-slate-600">Transactions logged: <span className="font-semibold text-ink">{txCount ?? '…'}</span></p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {isSelf ? "You can't change your own role." : isAdmin ? 'Admins can see every member and manage roles.' : 'Make this member an admin to give them access to this page.'}
          </p>
          <button
            onClick={toggleRole}
            disabled={isSelf || saving}
            className={cn(
              'flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-colors disabled:opacity-40 shrink-0',
              isAdmin ? 'border border-slate-200 text-ink hover:border-ink' : 'bg-ink text-white hover:bg-slate-700'
            )}
          >
            {isAdmin ? <Shield size={16} /> : <ShieldCheck size={16} />}
            {isAdmin ? 'Remove admin' : 'Make admin'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
