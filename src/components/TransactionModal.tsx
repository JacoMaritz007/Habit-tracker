import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, Plus, Upload, FileText, X, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import Papa from 'papaparse';
import { classifyTransactions, classifyRawCsv } from '../services/geminiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setCategory('');
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

        // Add to Firestore
        await onAdd(classifiedTransactions);
        
        onClose();
        setFile(null);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction" size="lg">
      <div className="space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'manual' ? "bg-white text-brand-bg shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'upload' ? "bg-white text-brand-bg shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                onClick={() => setType('expense')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                  type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <TrendingDown size={16} /> Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-bg focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Groceries, Rent, Salary"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-bg focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-bg focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-bg focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-bg text-white rounded-2xl font-bold hover:bg-brand-bg/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-bg/20 disabled:opacity-50"
            >
              {loading ? "Adding..." : <><Plus size={20} /> Add Transaction</>}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Bank Statement (CSV)</h4>
              <p className="text-xs text-slate-500">Upload a CSV export from your bank. AI will parse and categorise all transactions automatically.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                file ? "border-brand-bg bg-brand-bg/5" : "border-slate-200 hover:border-brand-bg hover:bg-slate-50"
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
                  <div className="w-12 h-12 bg-brand-bg rounded-xl flex items-center justify-center">
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
              className="w-full py-4 bg-brand-bg text-white rounded-2xl font-bold hover:bg-brand-bg/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-bg/20 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI is categorising...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Import Transactions</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
