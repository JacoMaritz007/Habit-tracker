import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, Plus, Upload, FileText, X, AlertCircle, Sparkles, ArrowLeft, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { CategorySelect } from './CategorySelect';
import { defaultCategory } from '../lib/categories';
import Papa from 'papaparse';
import { classifyTransactions, classifyRawCsv } from '../services/geminiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => Promise<void>;
  currency?: string;
}

type Draft = Omit<Transaction, 'id'> & { key: number; selected: boolean };

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', ZAR: 'R', AUD: 'A$', CAD: 'C$', INR: '₹', JPY: '¥' };

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onAdd, currency = 'USD' }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(defaultCategory('expense'));
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Review step: AI results are edited here before anything is saved.
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [bulkCategory, setBulkCategory] = useState('');

  const close = () => {
    setDrafts(null);
    setFile(null);
    setError(null);
    onClose();
  };

  const updateDraft = (key: number, patch: Partial<Draft>) =>
    setDrafts(ds => ds && ds.map(d => {
      if (d.key !== key) return d;
      const next = { ...d, ...patch };
      // Switching income/expense resets a category that no longer fits.
      if (patch.type && patch.type !== d.type) next.category = defaultCategory(patch.type);
      return next;
    }));

  const selectedDrafts = drafts?.filter(d => d.selected) ?? [];
  const bulkType = selectedDrafts.length && selectedDrafts.every(d => d.type === selectedDrafts[0].type) ? selectedDrafts[0].type : null;

  const saveDrafts = async () => {
    if (!drafts?.length) return;
    setImporting(true);
    setError(null);
    try {
      await onAdd(drafts.map(({ key, selected, ...t }) => t));
      close();
    } catch (err: any) {
      console.error(err);
      setError('Could not save the transactions. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    setLoading(true);
    try {
      await onAdd({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
      });
      onClose();
      // Reset form
      setAmount('');
      setCategory(defaultCategory(type));
      setDescription('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file.');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        if (!csvText || csvText.trim().length === 0) {
          throw new Error('The CSV file appears to be empty.');
        }

        // Call AI to parse and classify raw CSV
        const classifiedTransactions = await classifyRawCsv(csvText);
        
        if (!Array.isArray(classifiedTransactions) || classifiedTransactions.length === 0) {
          throw new Error('No valid transactions found in the CSV.');
        }

        // Show the review step; nothing is saved until the user confirms.
        setDrafts(classifiedTransactions.map((t, i) => ({ ...t, key: i, selected: false })));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to process CSV. Please check the file format.');
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read CSV file.');
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={drafts ? 'Review imported transactions' : 'Add Transaction'} size={drafts ? 'full' : 'lg'}>
      {drafts ? (
        <ReviewStep
          drafts={drafts}
          currency={currency}
          importing={importing}
          error={error}
          selectedCount={selectedDrafts.length}
          bulkType={bulkType}
          bulkCategory={bulkCategory}
          setBulkCategory={setBulkCategory}
          onUpdate={updateDraft}
          onToggleAll={on => setDrafts(ds => ds && ds.map(d => ({ ...d, selected: on })))}
          onApplyBulk={() => {
            if (!bulkCategory) return;
            setDrafts(ds => ds && ds.map(d => (d.selected ? { ...d, category: bulkCategory, selected: false } : d)));
            setBulkCategory('');
          }}
          onRemove={key => setDrafts(ds => ds && ds.filter(d => d.key !== key))}
          onBack={() => setDrafts(null)}
          onSave={saveDrafts}
        />
      ) : (
      <div className="space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'manual' ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'upload' ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Upload CSV
          </button>
        </div>

        {activeTab === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-2xl">
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory(defaultCategory('expense')); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                  type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <TrendingDown size={16} /> Expense
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory(defaultCategory('income')); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                  type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <TrendingUp size={16} /> Income
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{CURRENCY_SYMBOLS[currency] || '$'}</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <CategorySelect type={type} value={category} onChange={setCategory} className="!h-12 !rounded-2xl !bg-slate-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? "Adding..." : <><Plus size={20} /> Add Transaction</>}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Bank Statement (CSV)</h4>
              <p className="text-xs text-slate-500">Upload a CSV export from your bank. AI sorts every transaction into a category, and you can review and change them before saving.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                file ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary hover:bg-slate-50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
              />
              {file ? (
                <>
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Upload className="text-slate-400" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">Only CSV files are supported</p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-medium">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI is categorising...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Read & categorise</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      )}
    </Modal>
  );
};

const ReviewStep = ({
  drafts, currency, importing, error, selectedCount, bulkType, bulkCategory, setBulkCategory,
  onUpdate, onToggleAll, onApplyBulk, onRemove, onBack, onSave,
}: {
  drafts: Draft[];
  currency: string;
  importing: boolean;
  error: string | null;
  selectedCount: number;
  bulkType: 'income' | 'expense' | null;
  bulkCategory: string;
  setBulkCategory: (c: string) => void;
  onUpdate: (key: number, patch: Partial<Draft>) => void;
  onToggleAll: (on: boolean) => void;
  onApplyBulk: () => void;
  onRemove: (key: number) => void;
  onBack: () => void;
  onSave: () => void;
}) => {
  const income = drafts.filter(d => d.type === 'income').reduce((a, d) => a + d.amount, 0);
  const expense = drafts.filter(d => d.type === 'expense').reduce((a, d) => a + d.amount, 0);
  const allSelected = drafts.length > 0 && selectedCount === drafts.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-ink">{drafts.length} transactions</span> found ·
          {' '}<span className="text-emerald-600 font-semibold">{formatCurrency(income, currency)}</span> in ·
          {' '}<span className="text-rose-600 font-semibold">{formatCurrency(expense, currency)}</span> out.
          {' '}Check the categories, then save.
        </p>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{selectedCount} selected</span>
            {bulkType ? (
              <>
                <CategorySelect type={bulkType} value={bulkCategory} onChange={setBulkCategory} ariaLabel="Category for selected" className="w-48" />
                <button onClick={onApplyBulk} disabled={!bulkCategory}
                  className="h-9 px-4 rounded-full bg-ink text-white text-xs font-semibold disabled:opacity-40">Apply</button>
              </>
            ) : (
              <span className="text-xs text-slate-500">Select only income or only expenses to set a category.</span>
            )}
          </div>
        )}
      </div>

      <div className="max-h-[55vh] overflow-auto custom-scrollbar border border-slate-200 rounded-xl">
        <table className="wh-table">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-8"><input type="checkbox" checked={allSelected} onChange={e => onToggleAll(e.target.checked)} aria-label="Select all" /></th>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Category</th>
              <th className="is-num">Amount</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {drafts.map(d => (
              <tr key={d.key}>
                <td><input type="checkbox" checked={d.selected} onChange={e => onUpdate(d.key, { selected: e.target.checked })} aria-label={`Select ${d.description}`} /></td>
                <td className="whitespace-nowrap text-slate-600">{d.date}</td>
                <td className="max-w-[260px] truncate" title={d.description}>{d.description || '—'}</td>
                <td>
                  <select value={d.type} onChange={e => onUpdate(d.key, { type: e.target.value as Draft['type'] })}
                    className={cn('wh-select !h-9 !text-sm !pl-3 !w-28', d.type === 'income' ? 'text-emerald-600' : 'text-rose-600')} aria-label="Type">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </td>
                <td className="min-w-[200px]">
                  <CategorySelect type={d.type} value={d.category} onChange={c => onUpdate(d.key, { category: c })} />
                </td>
                <td className={cn('is-num font-semibold whitespace-nowrap', d.type === 'income' ? 'text-emerald-600' : 'text-ink')}>
                  {formatCurrency(d.amount, currency)}
                </td>
                <td>
                  <button onClick={() => onRemove(d.key)} className="p-1.5 text-slate-400 hover:text-rose-500" aria-label="Remove from import">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-medium">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 h-11 px-4 rounded-full text-sm font-semibold text-ink hover:bg-slate-100">
          <ArrowLeft size={16} /> Choose another file
        </button>
        <button onClick={onSave} disabled={importing || !drafts.length}
          className="flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 shadow-[0_8px_22px_rgba(244,124,32,.32)]">
          {importing ? 'Saving…' : `Save ${drafts.length} transactions`}
        </button>
      </div>
    </div>
  );
};
