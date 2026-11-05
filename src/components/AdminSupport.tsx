import React, { useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Inbox, Mail, CheckCircle2, RotateCcw, ArrowUpRight, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  CATEGORY_LABELS, SUPPORT_EMAIL, escalationMailto, markEscalated, setTicketStatus, subscribeAllTickets, ticketRef,
} from '../services/support';
import { StatusChip, SupportThread } from './SupportThread';
import type { SupportMessage, SupportStatus, SupportTicket } from '../types';

type Filter = 'active' | SupportStatus | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'active', label: 'Needs reply' },
  { id: 'answered', label: 'Replied' },
  { id: 'escalated', label: 'Escalated' },
  { id: 'closed', label: 'Resolved' },
  { id: 'all', label: 'All' },
];

// "Needs reply": open tickets, plus escalated ones where the member wrote last.
const needsReply = (t: SupportTicket) => t.status === 'open' || (t.status === 'escalated' && t.lastMessageBy === 'member');

export const AdminSupport = ({ admin }: { admin: { uid: string; name: string } }) => {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [filter, setFilter] = useState<Filter>('active');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);

  useEffect(() => subscribeAllTickets(setTickets), []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { active: 0, open: 0, answered: 0, escalated: 0, closed: 0, all: tickets?.length ?? 0 };
    tickets?.forEach(t => { c[t.status]++; if (needsReply(t)) c.active++; });
    return c;
  }, [tickets]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (tickets ?? [])
      .filter(t => filter === 'all' || (filter === 'active' ? needsReply(t) : t.status === filter))
      .filter(t => !q || [t.subject, t.userName, t.userEmail, ticketRef(t)].some(v => v?.toLowerCase().includes(q)));
  }, [tickets, filter, search]);

  const selected = tickets?.find(t => t.id === selectedId) ?? null;

  const escalate = async () => {
    if (!selected) return;
    window.location.href = escalationMailto(selected, messages);
    if (selected.status !== 'escalated') await markEscalated(selected, admin.uid).catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="wh-eyebrow mb-2">Admin</p>
        <h1 className="text-3xl font-black text-ink tracking-tight">Support inbox</h1>
        <p className="text-slate-500 mt-1">Reply to members here. Escalate anything you can't resolve to {SUPPORT_EMAIL}.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 space-y-3 border-b border-slate-100">
            <div className="flex gap-1.5 overflow-x-auto">
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={cn('wh-chip !h-8 shrink-0 border', filter === f.id ? 'is-active' : 'border-slate-200 !bg-white')}>
                  {f.label} <span className="opacity-60 tabular-nums">{counts[f.id]}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subject, member or ticket ref"
                className="h-10 w-full pl-9 pr-3 rounded-xl border border-slate-200 text-sm text-ink focus:outline-none focus:border-focus focus:ring-3 focus:ring-focus/30" />
            </div>
          </div>
          {tickets === null ? (
            <div className="p-4 space-y-3">{[1, 2, 3].map(i => <div key={i} className="wh-skeleton h-14" />)}</div>
          ) : !shown.length ? (
            <div className="wh-empty"><Inbox size={30} /><p className="text-sm">{filter === 'active' ? 'Nothing needs a reply.' : 'No tickets here.'}</p></div>
          ) : (
            <ul className="max-h-[65vh] overflow-y-auto custom-scrollbar">
              {shown.map(t => (
                <li key={t.id}>
                  <button onClick={() => setSelectedId(t.id)}
                    className={cn('w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors',
                      selectedId === t.id ? 'bg-primary-soft/60' : 'hover:bg-slate-50')}>
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm text-ink truncate', needsReply(t) ? 'font-bold' : 'font-medium')}>{t.subject}</p>
                      <StatusChip status={t.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {t.userName} · {ticketRef(t)} · {t.updatedAt?.toDate ? formatDistanceToNow(t.updatedAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          {!selected ? (
            <div className="wh-empty"><Mail size={30} /><p className="text-sm">Choose a ticket to read and reply.</p></div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-ink">{selected.subject}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {ticketRef(selected)} · {CATEGORY_LABELS[selected.category]} · opened {selected.createdAt?.toDate ? format(selected.createdAt.toDate(), 'd MMM yyyy HH:mm') : ''}
                  </p>
                  <p className="text-sm text-ink mt-2">
                    <span className="font-semibold">{selected.userName}</span>
                    {selected.userEmail && <> · <a href={`mailto:${selected.userEmail}`} className="text-focus hover:text-blue-700">{selected.userEmail}</a></>}
                  </p>
                </div>
                <StatusChip status={selected.status} />
              </div>

              <SupportThread
                key={selected.id}
                ticket={selected}
                viewer={admin}
                role="admin"
                onMessages={setMessages}
                footer={<>
                  <button onClick={escalate}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-ink text-white text-sm font-semibold hover:bg-slate-700"
                    title={`Opens an email to ${SUPPORT_EMAIL} with this conversation`}>
                    <ArrowUpRight size={15} /> Escalate by email
                  </button>
                  {selected.status === 'closed' ? (
                    <button onClick={() => setTicketStatus(selected, 'open')}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-ink hover:border-ink">
                      <RotateCcw size={15} /> Reopen
                    </button>
                  ) : (
                    <button onClick={() => setTicketStatus(selected, 'closed')}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-ink hover:border-ink">
                      <CheckCircle2 size={15} /> Resolve
                    </button>
                  )}
                </>}
              />
              {selected.status === 'escalated' && (
                <p className="text-xs text-slate-500">
                  Escalated to {SUPPORT_EMAIL}{selected.escalatedAt?.toDate ? ` on ${format(selected.escalatedAt.toDate(), 'd MMM yyyy HH:mm')}` : ''}. Replies here still reach the member.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
