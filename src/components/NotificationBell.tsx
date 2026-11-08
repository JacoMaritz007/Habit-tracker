import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Sparkles, TrendingUp, Award, Target, Flame, Megaphone, CheckCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { markAllRead, markRead, subscribeToNotifications } from '../services/notifications';
import type { AppNotification, NotificationType } from '../types';

const TYPE_STYLE: Record<NotificationType, { icon: any; tone: string }> = {
  welcome: { icon: Sparkles, tone: 'bg-primary-soft text-primary-ink' },
  level_up: { icon: TrendingUp, tone: 'bg-blue-50 text-blue-600' },
  badge: { icon: Award, tone: 'bg-amber-50 text-amber-600' },
  goal_complete: { icon: Target, tone: 'bg-emerald-50 text-emerald-600' },
  streak: { icon: Flame, tone: 'bg-primary-soft text-primary-ink' },
  announcement: { icon: Megaphone, tone: 'bg-ink text-white' },
};

export const NotificationBell = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToNotifications(userId, setItems), [userId]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = items.filter(n => !n.read);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 text-slate-400 hover:text-ink transition-colors relative"
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell size={20} />
        {unread.length > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-32px))] bg-white rounded-2xl border border-slate-200 shadow-lg z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-ink">Notifications</h3>
              {unread.length > 0 && (
                <button
                  onClick={() => markAllRead(unread.map(n => n.id)).catch(console.error)}
                  className="flex items-center gap-1 text-xs font-semibold text-focus hover:text-blue-700"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {!items.length && (
                <div className="wh-empty">
                  <Bell size={28} />
                  <p className="text-sm">You're all caught up.</p>
                </div>
              )}
              {items.map(n => {
                const { icon: Icon, tone } = TYPE_STYLE[n.type] ?? TYPE_STYLE.announcement;
                const when = n.createdAt?.toDate?.();
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id).catch(console.error)}
                    className={cn(
                      'w-full text-left flex gap-3 px-4 py-3 border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50',
                      !n.read && 'bg-primary-soft/40'
                    )}
                  >
                    <div className={cn('w-9 h-9 shrink-0 rounded-xl flex items-center justify-center', tone)}>
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className={cn('text-sm text-ink flex-1', !n.read ? 'font-bold' : 'font-medium')}>{n.title}</p>
                        {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" aria-label="Unread" />}
                      </div>
                      {n.body && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed whitespace-pre-line">{n.body}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {n.type === 'announcement' && 'From the Wealth Habits team · '}
                        {when ? formatDistanceToNow(when, { addSuffix: true }) : 'just now'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
