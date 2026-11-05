// Support tickets, their message threads and escalation against the rules.
import { doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, collection, query, where, orderBy, writeBatch, serverTimestamp } from 'firebase/firestore';
import { setup, checker } from './helpers.mjs';

const env = await setup('demo-wealth-support');
const { check, report } = checker();

await env.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'users/jaco'), { uid: 'jaco', email: 'jaco@wealthu.org', role: 'user' });
  await setDoc(doc(db, 'users/bob'), { uid: 'bob', email: 'bob@example.com', role: 'user' });
  await setDoc(doc(db, 'users/alice'), { uid: 'alice', email: 'alice@example.com', role: 'user' });
});

const jaco = env.authenticatedContext('jaco', { email: 'jaco@wealthu.org', email_verified: true }).firestore();
const bob = env.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true }).firestore();
const alice = env.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true }).firestore();

const ticket = (userId, extra = {}) => ({
  userId, userEmail: `${userId}@example.com`, userName: userId, subject: 'Cannot import CSV', category: 'technical',
  status: 'open', lastMessageBy: 'member', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra,
});
const msg = (authorId, authorRole, body = 'Hello') => ({ authorId, authorName: authorId, authorRole, body, createdAt: serverTimestamp() });

await check('member opens a ticket with first message (one batch)', 'allow', () => {
  const b = writeBatch(bob);
  b.set(doc(bob, 'support_tickets/t1'), ticket('bob'));
  b.set(doc(bob, 'support_tickets/t1/messages/m1'), msg('bob', 'member', 'My CSV upload fails'));
  return b.commit();
});
await check('member cannot open a ticket for someone else', 'deny', () => setDoc(doc(bob, 'support_tickets/x1'), ticket('alice')));
await check('member cannot open a ticket as answered', 'deny', () => setDoc(doc(bob, 'support_tickets/x2'), ticket('bob', { status: 'answered' })));
await check('member cannot use an unknown category', 'deny', () => setDoc(doc(bob, 'support_tickets/x3'), ticket('bob', { category: 'urgent' })));
await check('empty subject rejected', 'deny', () => setDoc(doc(bob, 'support_tickets/x4'), ticket('bob', { subject: '' })));
await check('member cannot add extra ticket fields', 'deny', () => setDoc(doc(bob, 'support_tickets/x5'), ticket('bob', { priority: 'high' })));

await check('member reads own ticket', 'allow', () => getDoc(doc(bob, 'support_tickets/t1')));
await check("member cannot read another member's ticket", 'deny', () => getDoc(doc(alice, 'support_tickets/t1')));
await check('member lists own tickets', 'allow', () => getDocs(query(collection(bob, 'support_tickets'), where('userId', '==', 'bob'))));
await check('member cannot list all tickets', 'deny', () => getDocs(collection(bob, 'support_tickets')));
await check('member reads own thread', 'allow', () => getDocs(query(collection(bob, 'support_tickets/t1/messages'), orderBy('createdAt'))));
await check("member cannot read another member's thread", 'deny', () => getDocs(collection(alice, 'support_tickets/t1/messages')));
await check("member cannot post in another member's ticket", 'deny', () => setDoc(doc(alice, 'support_tickets/t1/messages/a1'), msg('alice', 'member')));
await check('member cannot post as admin', 'deny', () => setDoc(doc(bob, 'support_tickets/t1/messages/f1'), msg('bob', 'admin')));
await check('member cannot spoof author', 'deny', () => setDoc(doc(bob, 'support_tickets/t1/messages/f2'), msg('jaco', 'member')));

await check('admin lists all tickets', 'allow', () => getDocs(query(collection(jaco, 'support_tickets'), orderBy('updatedAt', 'desc'))));
await check('admin reads any thread', 'allow', () => getDocs(collection(jaco, 'support_tickets/t1/messages')));
await check('admin replies and marks answered', 'allow', () => {
  const b = writeBatch(jaco);
  b.set(doc(jaco, 'support_tickets/t1/messages/m2'), msg('jaco', 'admin', 'Try saving it as CSV UTF-8'));
  b.update(doc(jaco, 'support_tickets/t1'), { status: 'answered', lastMessageBy: 'admin', updatedAt: serverTimestamp() });
  return b.commit();
});
await check('admin sends support reply notification', 'allow', () =>
  setDoc(doc(jaco, 'notifications/n1'), { userId: 'bob', type: 'support_reply', title: 'Support replied', body: 'x', read: false, sentBy: 'jaco', createdAt: serverTimestamp() }));
await check('member cannot send support reply notification', 'deny', () =>
  setDoc(doc(bob, 'notifications/n2'), { userId: 'alice', type: 'support_reply', title: 'Support replied', body: 'x', read: false, sentBy: 'bob', createdAt: serverTimestamp() }));
await check('admin escalates ticket', 'allow', () =>
  updateDoc(doc(jaco, 'support_tickets/t1'), { status: 'escalated', escalatedAt: serverTimestamp(), escalatedBy: 'jaco', updatedAt: serverTimestamp() }));
await check('admin cannot rewrite ticket subject', 'deny', () => updateDoc(doc(jaco, 'support_tickets/t1'), { subject: 'changed', updatedAt: serverTimestamp() }));

await check('member replies and reopens', 'allow', () => {
  const b = writeBatch(bob);
  b.set(doc(bob, 'support_tickets/t1/messages/m3'), msg('bob', 'member', 'Still failing'));
  b.update(doc(bob, 'support_tickets/t1'), { status: 'open', lastMessageBy: 'member', updatedAt: serverTimestamp() });
  return b.commit();
});
await check('member closes own ticket', 'allow', () => updateDoc(doc(bob, 'support_tickets/t1'), { status: 'closed', updatedAt: serverTimestamp() }));
await check('member cannot mark own ticket escalated', 'deny', () => updateDoc(doc(bob, 'support_tickets/t1'), { status: 'escalated', updatedAt: serverTimestamp() }));
await check("member cannot close another member's ticket", 'deny', () => updateDoc(doc(alice, 'support_tickets/t1'), { status: 'closed', updatedAt: serverTimestamp() }));
await check('messages cannot be edited', 'deny', () => updateDoc(doc(bob, 'support_tickets/t1/messages/m1'), { body: 'edited' }));
await check('messages cannot be deleted', 'deny', () => deleteDoc(doc(bob, 'support_tickets/t1/messages/m1')));
await check('member cannot delete ticket', 'deny', () => deleteDoc(doc(bob, 'support_tickets/t1')));

report();
await env.cleanup();
