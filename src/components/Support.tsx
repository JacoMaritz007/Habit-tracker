import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LifeBuoy, Plus, Mail, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORY_LABELS, SUPPORT_EMAIL, openTicket, setTicketStatus, subscribeMyTickets, ticketRef } from '../services/support';
import { StatusChip, SupportThread } from './SupportThread';
import type { SupportCategory, SupportTicket } from '../types';

export const Support = ({ user }: { user: { uid: string; displayName?: string | null; email?: string | null } }) => {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [view, setView] = useState<'list' | 'new' | string>('list');
  const me = { uid: user.uid, name: user.displayName || user.email?.split('@')[0] || 'Member', email: user.email || '' };

  useEffect(() => subscribeMyTickets(user.uid, setTickets), [user.uid]);

  const active = tickets?.find(t => t.id === view);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="wh-eyebrow mb-2">Support</p>
          <h1 className="text-3xl font-black text-ink tracking-tight">How can we help?</h1>
          <p className="text-slate-500 mt-1">Send us a message and the team will reply here. You'll get a notification when they do.</p>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('new')}
            className="flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-[0_8px_22px_rgba(244,124,32,.32)] self-start sm:self-auto">
            <Plus size={18} /> New request
          </button>
        )}
      </div>

      {view === 'new' ? (
        <NewRequest me={me} onCancel={() => setView('list')} onCreated={id => setView(id)} />
      ) : active ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
            <ArrowLeft size={16} /> All requests
          </button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">{active.subject}</h2>
              <p className="text-xs text-slate-500 mt-1">{ticketRef(active)} · {CATEGORY_LABELS[active.category]}</p>
            </div>
            <StatusChip status={active.status} />
          </div>
          <SupportThread
            ticket={active}
            viewer={me}
            role="member"
            footer={active.status !== 'closed' && (
              <button onClick={() => setTicketStatus(active, 'closed')}
                className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-ink hover:border-ink">
                <CheckCircle2 size={15} /> Mark resolved
              </button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-ink">Your requests</h3>
            </div>
            {tickets === null ? (
              <div className="p-5 space-y-3">{[1, 2].map(i => <div key={i} className="wh-skeleton h-14" />)}</div>
            ) : !tickets.length ? (
              <div className="wh-empty">
                <LifeBuoy size={32} />
                <p className="text-sm">No support requests yet.</p>
                <button onClick={() => setView('new')} className="mt-2 h-10 px-5 rounded-full bg-primary text-white text-sm font-semibold">New request</button>
              </div>
            ) : (
              <ul>
                {tickets.map(t => (
                  <li key={t.id}>
                    <button onClick={() => setView(t.id)}
                      className="w-full text-left px-5 py-4 flex items-center gap-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                        t.lastMessageBy === 'admin' && t.status !== 'closed' ? 'bg-primary-soft text-primary-ink' : 'bg-slate-100 text-slate-500')}>
                        <MessageSquare size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{t.subject}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ticketRef(t)} · updated {t.updatedAt?.toDate ? formatDistanceToNow(t.updatedAt.toDate(), { addSuffix: true }) : 'just now'}
                        </p>
                      </div>
                      <StatusChip status={t.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="brand-gradient rounded-2xl p-6 text-white space-y-3">
            <Mail size={24} className="text-primary" />
            <h3 className="text-lg font-bold text-white">Prefer email?</h3>
            <p className="text-sm text-white/70">You can also reach the Wealth University support team directly.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-block text-sm font-semibold text-primary hover:text-white break-all">{SUPPORT_EMAIL}</a>
          </div>
        </div>
      )}
    </div>
  );
};

const NewRequest = ({ me, onCancel, onCreated }: {
  me: { uid: string; name: string; email: string };
  onCancel: () => void;
  onCreated: (id: string) => void;
}) => {
  const [category, setCategory] = useState<SupportCategory>('technical');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      onCreated(await openTicket(me, { category, subject: subject.trim(), body: body.trim() }));
    } catch (err) {
      console.error(err);
      setError(`Your request could not be sent. Please try again, or email ${SUPPORT_EMAIL}.`);
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold text-ink">New support request</h2>
      <div className="wh-field">
        <label className="wh-field__label" htmlFor="sup-cat">What is it about?</label>
        <select id="sup-cat" className="wh-select" value={category} onChange={e => setCategory(e.target.value as SupportCategory)}>
          {(Object.keys(CATEGORY_LABELS) as SupportCategory[]).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>
      <div className="wh-field">
        <label className="wh-field__label" htmlFor="sup-subject">Subject</label>
        <input id="sup-subject" className="wh-input" required maxLength={150} value={subject} onChange={e => setSubject(e.target.value)}
          placeholder="e.g. My bank statement won't import" />
      </div>
      <div className="wh-field">
        <label className="wh-field__label" htmlFor="sup-body">Message</label>
        <textarea id="sup-body" className="wh-textarea !min-h-[140px]" required maxLength={5000} value={body} onChange={e => setBody(e.target.value)}
          placeholder="Tell us what happened and what you expected. Screenshots aren't supported yet, so describe any error message you see." />
        <span className="wh-field__hint">{body.length}/5000</span>
      </div>
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="h-11 px-4 rounded-full text-sm font-semibold text-ink hover:bg-slate-100">Cancel</button>
        <button type="submit" disabled={sending || !subject.trim() || !body.trim()}
          className="h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50">
          {sending ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  );
};
