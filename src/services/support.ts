import {
  collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../firebase';
import type { SupportCategory, SupportMessage, SupportStatus, SupportTicket } from '../types';

export const SUPPORT_EMAIL = 'support@wealthuniversity.org';

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  account: 'Account & sign-in',
  technical: 'Something isn’t working',
  billing: 'Billing & payments',
  coaching: 'Coaching & content',
  feedback: 'Feedback or idea',
  other: 'Something else',
};

export const STATUS_LABELS: Record<SupportStatus, string> = {
  open: 'Waiting for support',
  answered: 'Support replied',
  escalated: 'Escalated',
  closed: 'Resolved',
};

const tickets = collection(db, 'support_tickets');
const messagesOf = (ticketId: string) => collection(db, 'support_tickets', ticketId, 'messages');
const byUpdated = (a: SupportTicket, b: SupportTicket) =>
  (b.updatedAt?.toDate?.().getTime() ?? Date.now()) - (a.updatedAt?.toDate?.().getTime() ?? Date.now());

type Person = { uid: string; name: string; email?: string };

// Ticket and first message are written together so a ticket never exists
// without the member's message.
export async function openTicket(member: Person, input: { subject: string; category: SupportCategory; body: string }) {
  const ref = doc(tickets);
  const batch = writeBatch(db);
  batch.set(ref, {
    userId: member.uid,
    userEmail: member.email || '',
    userName: member.name,
    subject: input.subject,
    category: input.category,
    status: 'open',
    lastMessageBy: 'member',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(messagesOf(ref.id)), {
    authorId: member.uid, authorName: member.name, authorRole: 'member', body: input.body, createdAt: serverTimestamp(),
  });
  await batch.commit();
  return ref.id;
}

// A reply moves the ticket to "answered" (admin) or back to "open" (member),
// and an admin reply notifies the member in their bell.
export async function postReply(ticket: SupportTicket, author: Person, role: 'member' | 'admin', body: string) {
  const batch = writeBatch(db);
  batch.set(doc(messagesOf(ticket.id)), {
    authorId: author.uid, authorName: author.name, authorRole: role, body, createdAt: serverTimestamp(),
  });
  batch.update(doc(tickets, ticket.id), {
    status: role === 'admin' ? (ticket.status === 'escalated' ? 'escalated' : 'answered') : 'open',
    lastMessageBy: role,
    updatedAt: serverTimestamp(),
  });
  if (role === 'admin') {
    batch.set(doc(collection(db, 'notifications')), {
      userId: ticket.userId,
      type: 'support_reply',
      title: `Support replied: ${ticket.subject}`.slice(0, 120),
      body: body.length > 280 ? `${body.slice(0, 277)}…` : body,
      read: false,
      sentBy: author.uid,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export const setTicketStatus = (ticket: SupportTicket, status: SupportStatus) =>
  updateDoc(doc(tickets, ticket.id), { status, updatedAt: serverTimestamp() });

export const markEscalated = (ticket: SupportTicket, adminUid: string) =>
  updateDoc(doc(tickets, ticket.id), { status: 'escalated', escalatedAt: serverTimestamp(), escalatedBy: adminUid, updatedAt: serverTimestamp() });

export function subscribeMyTickets(uid: string, onChange: (t: SupportTicket[]) => void) {
  return onSnapshot(
    query(tickets, where('userId', '==', uid)),
    snap => onChange(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)).sort(byUpdated)),
    err => console.error('Support tickets listener failed', err)
  );
}

export function subscribeAllTickets(onChange: (t: SupportTicket[]) => void) {
  return onSnapshot(
    query(tickets, orderBy('updatedAt', 'desc'), limit(300)),
    snap => onChange(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket))),
    err => console.error('Support inbox listener failed', err)
  );
}

export function subscribeMessages(ticketId: string, onChange: (m: SupportMessage[]) => void) {
  return onSnapshot(
    query(messagesOf(ticketId), orderBy('createdAt', 'asc')),
    snap => onChange(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportMessage))),
    err => console.error('Support thread listener failed', err)
  );
}

export const ticketRef = (ticket: SupportTicket) => `WH-${ticket.id.slice(0, 6).toUpperCase()}`;

// Escalation opens the admin's email client with the full ticket, so it can
// be handed to the Wealth University support team.
export function escalationMailto(ticket: SupportTicket, messages: SupportMessage[]) {
  const when = (m: SupportMessage) => (m.createdAt?.toDate ? format(m.createdAt.toDate(), 'd MMM yyyy HH:mm') : '');
  const thread = messages
    .map(m => `--- ${m.authorRole === 'admin' ? 'Support' : 'Member'} (${m.authorName}) · ${when(m)}\n${m.body}`)
    .join('\n\n');
  const body = [
    `Escalated support ticket ${ticketRef(ticket)}`,
    '',
    `Member: ${ticket.userName} <${ticket.userEmail || 'no email'}>`,
    `Topic: ${CATEGORY_LABELS[ticket.category]}`,
    `Subject: ${ticket.subject}`,
    `Opened: ${ticket.createdAt?.toDate ? format(ticket.createdAt.toDate(), 'd MMM yyyy HH:mm') : ''}`,
    '',
    'Conversation:',
    '',
    thread,
  ].join('\n');
  const subject = `[Escalation ${ticketRef(ticket)}] ${ticket.subject}`;
  // Mail clients cap mailto length; keep a safe margin.
  const safeBody = body.length > 1800 ? `${body.slice(0, 1800)}\n\n[Conversation truncated, see the Support inbox for the full thread.]` : body;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}
