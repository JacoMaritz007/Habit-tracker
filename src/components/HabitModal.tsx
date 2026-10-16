import React, { useState } from 'react';
import { Modal } from './Modal';
import { Habit } from '../types';
import { Plus } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id'>) => Promise<void>;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      await onAdd({
        title,
        description,
        completedDays: [],
        streak: 0,
      });
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Habit">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Habit Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 24-Hour Purchase Pause"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this habit matters..."
              className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-focus/30 focus:border-transparent outline-none resize-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {loading ? "Adding..." : <><Plus size={20} /> Add Habit</>}
        </button>
      </form>
    </Modal>
  );
};
