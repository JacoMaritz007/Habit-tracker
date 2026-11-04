// Notifications and admin announcements against the rules.
import { doc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { setup, checker } from './helpers.mjs';

const env = await setup('demo-wealth-notifications');
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
const n = (userId, type, extra = {}) => ({ userId, type, title: 'Hi', body: 'b', read: false, createdAt: serverTimestamp(), ...extra });

await check('member creates own badge notification', 'allow', () => setDoc(doc(bob, 'notifications/b1'), n('bob', 'badge')));
await check('member creates own welcome notification', 'allow', () => addDoc(collection(bob, 'notifications'), n('bob', 'welcome')));
await check('member cannot notify another member', 'deny', () => addDoc(collection(bob, 'notifications'), n('alice', 'badge')));
await check('member cannot send an announcement', 'deny', () => addDoc(collection(bob, 'notifications'), n('alice', 'announcement', { sentBy: 'bob' })));
await check('member cannot create already-read notification', 'deny', () => addDoc(collection(bob, 'notifications'), n('bob', 'badge', { read: true })));
await check('member cannot add extra fields', 'deny', () => addDoc(collection(bob, 'notifications'), n('bob', 'badge', { link: 'https://evil' })));
await check('member cannot use an unknown type', 'deny', () => addDoc(collection(bob, 'notifications'), n('bob', 'system')));
await check('empty title rejected', 'deny', () => addDoc(collection(bob, 'notifications'), n('bob', 'badge', { title: '' })));
await check('admin sends announcement to a member', 'allow', () => setDoc(doc(jaco, 'notifications/a1'), n('bob', 'announcement', { sentBy: 'jaco' })));
await check('admin announcement must name sender', 'deny', () => addDoc(collection(jaco, 'notifications'), n('bob', 'announcement')));
await check('admin cannot spoof another sender', 'deny', () => addDoc(collection(jaco, 'notifications'), n('bob', 'announcement', { sentBy: 'alice' })));
await check('admin broadcast in one batch', 'allow', () => {
  const b = writeBatch(jaco);
  for (const u of ['bob', 'alice', 'jaco']) b.set(doc(collection(jaco, 'notifications')), n(u, 'announcement', { sentBy: 'jaco' }));
  return b.commit();
});
await check('member lists own notifications (newest first)', 'allow', () =>
  getDocs(query(collection(bob, 'notifications'), where('userId', '==', 'bob'), orderBy('createdAt', 'desc'), limit(30))));
await check("member cannot list another member's notifications", 'deny', () =>
  getDocs(query(collection(alice, 'notifications'), where('userId', '==', 'bob'))));
await check('member marks own notification read', 'allow', () => updateDoc(doc(bob, 'notifications/a1'), { read: true }));
await check('member cannot edit notification text', 'deny', () => updateDoc(doc(bob, 'notifications/a1'), { title: 'changed' }));
await check("member cannot mark another member's notification", 'deny', () => updateDoc(doc(alice, 'notifications/a1'), { read: true }));
await check('member deletes own notification', 'allow', () => deleteDoc(doc(bob, 'notifications/b1')));

report();
await env.cleanup();
