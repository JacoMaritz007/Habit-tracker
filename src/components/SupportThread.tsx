import React, { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { postReply, subscribeMessages, STATUS_LABELS } from '../services/support';
import type { SupportMessage, SupportStatus, SupportTicket } from '../types';

export const STATUS_TONE: Record<SupportStatus, string> = {
  open: 'wh-chip--orange',
  answered: 'wh-chip--green',
  escalated: 'wh-chip--blue',
  closed: '',
};

export const StatusChip = ({ status }: { status: SupportStatus }) => (
  <span className={cn('wh-chip !h-6 !text-xs', STATUS_TONE[status])}>{STATUS_LABELS[status]}</span>
);

// Conversation for one ticket, shared by the member page and the admin inbox.
export const SupportThread = ({ ticket, viewer, role, onMessages, footer }: {
  ticket: SupportTicket;
  viewer: { uid: string; name: string };
  role: 'member' | 'admin';
  onMessages?: (m: SupportMessage[]) => void;
  footer?: React.ReactNode;
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeMessages(ticket.id, m => { setMessages(m); onMessages?.(m); }), [ticket.id]);
  // Braces matter: scrollIntoView returns a Promise in newer browsers, and an
  // effect may only return a cleanup function.
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = reply.trim();
    if (!body) return;
    setSending(true);
    setError('');
    try {
      await postReply(ticket, viewer, role, body);
      setReply('');
    } catch (err) {
      console.error(err);
      setError('Your message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3 max-h-[46vh] overflow-y-auto custom-scrollbar pr-1">
        {messages.map(m => {
          const mine = m.authorId === viewer.uid;
          const fromSupport = m.authorRole === 'admin';
          const when = m.createdAt?.toDate?.();
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                mine ? 'bg-primary-soft text-ink rounded-br-md' : fromSupport ? 'bg-ink text-white rounded-bl-md' : 'bg-slate-100 text-ink rounded-bl-md'
              )}>
                <p className={cn('text-[11px] font-semibold mb-1', mine ? 'text-primary-ink' : fromSupport ? 'text-white/70' : 'text-slate-500')}>
                  {fromSupport ? `${m.authorName} · Wealth Habits support` : m.authorName}
                  {' · '}{when ? formatDistanceToNow(when, { addSuffix: true }) : 'sending…'}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {ticket.status === 'closed' && role === 'member' ? (
        <p className="text-sm text-slate-500">This request is resolved. Reply below to reopen it.</p>
      ) : null}

      <form onSubmit={send} className="space-y-2">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          maxLength={5000}
          placeholder={role === 'admin' ? 'Write a reply to the member…' : 'Add more detail or reply to support…'}
          className="wh-textarea !min-h-[96px]"
          aria-label="Reply"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e as any); }}
        />
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">{footer}</div>
          <button type="submit" disabled={sending || !reply.trim()}
            className="flex items-center gap-2 h-10 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50">
            <Send size={15} /> {sending ? 'Sending…' : role === 'admin' ? 'Send reply' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
