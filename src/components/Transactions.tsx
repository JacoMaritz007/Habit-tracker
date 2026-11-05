import React, { useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Plus, Search, Pencil, Trash2, Sparkles, X, Receipt } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { CategorySelect } from './CategorySelect';
import { Modal } from './Modal';
import { defaultCategory } from '../lib/categories';
import type { Transaction } from '../types';
import { merchantKey } from '../lib/transactions';

type Patch = Partial<Pick<Transaction, 'date' | 'amount' | 'category' | 'description' | 'type'>>;

// Bank descriptions carry card numbers, dates and references, so compare
// on the words only: "CLICKS PHARMACY 1234 23/10" ≈ "Clicks Pharmacy 5678".
const monthLabel = (ym: string) => {
  const d = parseISO(`${ym}-01`);
  return isValid(d) ? format(d, 'MMMM yyyy') : ym;
};

const PAGE = 100;

export const Transactions = ({ transactions, currency, onAdd, onUpdate, onDelete }: {
  transactions: Transaction[];
  currency?: string;
  onAdd: () => void;
  onUpdate: (ids: string[], patch: Patch) => Promise<void>;
  onDelete: (ids: string[]) => Promise<void>;
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [month, setMonth] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState('');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [suggestion, setSuggestion] = useState<{ category: string; ids: string[]; label: string } | null>(null);
  const [visible, setVisible] = useState(PAGE);

  const months = useMemo(
    () => [...new Set(transactions.map(t => t.date?.slice(0, 7)).filter(Boolean))].sort().reverse(),
    [transactions]
  );
  const categories = useMemo(() => [...new Set(transactions.map(t => t.category))].sort(), [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions
      .filter(t => typeFilter === 'all' || t.type === typeFilter)
      .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
      .filter(t => month === 'all' || t.date?.startsWith(month))
      .filter(t => !q || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [transactions, search, typeFilter, categoryFilter, month]);

  const shown = filtered.slice(0, visible);
  const income = filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  const selectedTx = transactions.filter(t => selected.has(t.id));
  const bulkType = selectedTx.length && selectedTx.every(t => t.type === selectedTx[0].type) ? selectedTx[0].type : null;
  const allShownSelected = shown.length > 0 && shown.every(t => selected.has(t.id));

  const toggle = (id: string, on: boolean) =>
    setSelected(prev => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const changeCategory = async (t: Transaction, category: string) => {
    await onUpdate([t.id], { category });
    // Offer to recategorise the same merchant's other transactions.
    const key = merchantKey(t.description);
    if (!key) return setSuggestion(null);
    const similar = transactions.filter(o => o.id !== t.id && o.type === t.type && o.category !== category && merchantKey(o.description) === key);
    setSuggestion(similar.length ? { category, ids: similar.map(o => o.id), label: t.description } : null);
  };

  const applyBulk = async () => {
    if (!bulkCategory || !selected.size) return;
    await onUpdate([...selected], { category: bulkCategory });
    setSelected(new Set());
    setBulkCategory('');
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.size} transaction${selected.size === 1 ? '' : 's'}? This can't be undone.`)) return;
    await onDelete([...selected]);
    setSelected(new Set());
  };

  const filtersActive = search || typeFilter !== 'all' || categoryFilter !== 'all' || month !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Transactions</h1>
          <p className="text-slate-500 mt-1">Change any category to keep your spending breakdown accurate.</p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-[0_8px_22px_rgba(244,124,32,.32)] self-start sm:self-auto">
          <Plus size={18} /> Add or import
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 flex flex-col lg:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setVisible(PAGE); }} placeholder="Search description or category"
              className="h-10 w-full pl-9 pr-3 rounded-xl border border-slate-200 text-sm text-ink focus:outline-none focus:border-focus focus:ring-3 focus:ring-focus/30" />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="wh-select !h-10 !text-sm lg:!w-36" aria-label="Filter by type">
              <option value="all">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="wh-select !h-10 !text-sm lg:!w-52" aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(e.target.value)} className="wh-select !h-10 !text-sm lg:!w-44" aria-label="Filter by month">
              <option value="all">All months</option>
              {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 border-b border-slate-100 text-sm">
          <p className="text-slate-600">
            <span className="font-semibold text-ink">{filtered.length}</span> transaction{filtered.length === 1 ? '' : 's'} ·
            {' '}<span className="font-semibold text-emerald-600">{formatCurrency(income, currency)}</span> in ·
            {' '}<span className="font-semibold text-rose-600">{formatCurrency(expense, currency)}</span> out
            {filtersActive && (
              <button onClick={() => { setSearch(''); setTypeFilter('all'); setCategoryFilter('all'); setMonth('all'); }}
                className="ml-3 text-xs font-semibold text-focus hover:text-blue-700">Clear filters</button>
            )}
          </p>
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">{selected.size} selected</span>
              {bulkType ? (
                <>
                  <CategorySelect type={bulkType} value={bulkCategory} onChange={setBulkCategory} ariaLabel="Category for selected" className="w-52" />
                  <button onClick={applyBulk} disabled={!bulkCategory}
                    className="h-9 px-4 rounded-full bg-ink text-white text-xs font-semibold disabled:opacity-40">Set category</button>
                </>
              ) : (
                <span className="text-xs text-slate-500">Select only income or only expenses to set a category.</span>
              )}
              <button onClick={deleteSelected} className="h-9 px-3 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
              <button onClick={() => setSelected(new Set())} className="p-1.5 text-slate-400 hover:text-ink" aria-label="Clear selection"><X size={15} /></button>
            </div>
          )}
        </div>

        {suggestion && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-primary-soft flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink">
              <Sparkles size={15} className="inline -mt-0.5 mr-1.5 text-primary-ink" />
              Also set <span className="font-semibold">{suggestion.ids.length}</span> other transaction{suggestion.ids.length === 1 ? '' : 's'} like
              {' '}<span className="font-semibold">"{suggestion.label}"</span> to <span className="font-semibold">{suggestion.category}</span>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={async () => { await onUpdate(suggestion.ids, { category: suggestion.category }); setSuggestion(null); }}
                className="h-9 px-4 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-hover">Apply to all</button>
              <button onClick={() => setSuggestion(null)} className="h-9 px-3 rounded-full text-xs font-semibold text-ink hover:bg-white/60">No thanks</button>
            </div>
          </div>
        )}

        {!transactions.length ? (
          <div className="wh-empty">
            <Receipt size={32} />
            <p className="text-sm">No transactions yet. Add one, or import a bank statement CSV.</p>
            <button onClick={onAdd} className="mt-2 h-10 px-5 rounded-full bg-primary text-white text-sm font-semibold">Add or import</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="wh-table">
              <thead>
                <tr>
                  <th className="w-8">
                    <input type="checkbox" checked={allShownSelected} aria-label="Select all shown"
                      onChange={e => setSelected(prev => {
                        const next = new Set(prev);
                        shown.forEach(t => (e.target.checked ? next.add(t.id) : next.delete(t.id)));
                        return next;
                      })} />
                  </th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="is-num">Amount</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {shown.map(t => (
                  <tr key={t.id} className={cn(selected.has(t.id) && 'bg-primary-soft/40')}>
                    <td><input type="checkbox" checked={selected.has(t.id)} onChange={e => toggle(t.id, e.target.checked)} aria-label={`Select ${t.description}`} /></td>
                    <td className="whitespace-nowrap text-slate-600">{t.date}</td>
                    <td className="max-w-[320px]">
                      <p className="truncate" title={t.description}>{t.description || '—'}</p>
                      <p className={cn('text-[11px] font-semibold uppercase tracking-wide', t.type === 'income' ? 'text-emerald-600' : 'text-slate-400')}>{t.type}</p>
                    </td>
                    <td className="min-w-[210px]">
                      <CategorySelect type={t.type} value={t.category} onChange={c => changeCategory(t, c)} />
                    </td>
                    <td className={cn('is-num font-semibold whitespace-nowrap', t.type === 'income' ? 'text-emerald-600' : 'text-ink')}>
                      {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount, currency)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(t)} className="p-1.5 text-slate-400 hover:text-ink" aria-label="Edit transaction"><Pencil size={15} /></button>
                        <button onClick={() => window.confirm('Delete this transaction?') && onDelete([t.id])} className="p-1.5 text-slate-400 hover:text-rose-500" aria-label="Delete transaction"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-10">No transactions match these filters.</td></tr>
                )}
              </tbody>
            </table>
            {filtered.length > visible && (
              <div className="p-4 text-center">
                <button onClick={() => setVisible(v => v + PAGE)} className="h-10 px-5 rounded-full border border-slate-200 text-sm font-semibold text-ink hover:border-ink">
                  Show more ({filtered.length - visible} left)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <EditTransaction transaction={editing} currency={currency} onClose={() => setEditing(null)}
        onSave={async patch => { if (editing) await onUpdate([editing.id], patch); setEditing(null); }} />
    </div>
  );
};

const EditTransaction = ({ transaction, onClose, onSave }: {
  transaction: Transaction | null;
  currency?: string;
  onClose: () => void;
  onSave: (patch: Patch) => Promise<void>;
}) => {
  const [form, setForm] = useState<Patch>({});
  const [saving, setSaving] = useState(false);
  React.useEffect(() => {
    if (transaction) {
      const { date, amount, category, description, type } = transaction;
      setForm({ date, amount, category, description, type });
    }
  }, [transaction]);
  if (!transaction) return null;
  const type = form.type ?? transaction.type;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave({ ...form, amount: Math.abs(Number(form.amount) || 0) }); } finally { setSaving(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit transaction" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="wh-segmented w-full">
          {(['expense', 'income'] as const).map(t => (
            <button key={t} type="button" className={cn('flex-1 capitalize', type === t && 'is-active')}
              onClick={() => setForm(f => ({ ...f, type: t, category: t === (transaction.type) ? transaction.category : defaultCategory(t) }))}>
              {t}
            </button>
          ))}
        </div>
        <div className="wh-field">
          <label className="wh-field__label" htmlFor="tx-desc">Description</label>
          <input id="tx-desc" className="wh-input" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="wh-field">
            <label className="wh-field__label" htmlFor="tx-amount">Amount</label>
            <input id="tx-amount" className="wh-input" type="number" step="0.01" min="0" required value={form.amount ?? ''}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value as any }))} />
          </div>
          <div className="wh-field">
            <label className="wh-field__label" htmlFor="tx-date">Date</label>
            <input id="tx-date" className="wh-input" type="date" required value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div className="wh-field">
          <span className="wh-field__label">Category</span>
          <CategorySelect type={type} value={form.category ?? ''} onChange={c => setForm(f => ({ ...f, category: c }))} className="!h-11" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-full text-sm font-semibold text-ink hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={saving} className="h-10 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
