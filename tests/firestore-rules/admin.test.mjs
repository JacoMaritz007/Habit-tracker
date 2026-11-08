// Admin section access (src/components/Admin.tsx) against the rules.
import { doc, setDoc, updateDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { setup, checker } from './helpers.mjs';

const env = await setup('demo-wealth-admin');
const { check, report } = checker();

await env.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'users/jaco'), { uid: 'jaco', email: 'jaco@wealthu.org', role: 'user', xp: 0 });
  await setDoc(doc(db, 'users/bob'), { uid: 'bob', email: 'bob@example.com', role: 'user', xp: 40 });
  await setDoc(doc(db, 'users/carol'), { uid: 'carol', email: 'carol@example.com', role: 'admin', xp: 10 });
  await setDoc(doc(db, 'habits/h1'), { userId: 'bob', title: 'Read', streak: 3 });
  await setDoc(doc(db, 'goals/g1'), { userId: 'bob', title: 'Fund', targetAmount: 100, currentAmount: 20 });
  await setDoc(doc(db, 'transactions/t1'), { userId: 'bob', amount: 5, type: 'expense' });
});

const jaco = env.authenticatedContext('jaco', { email: 'jaco@wealthu.org', email_verified: true }).firestore();
const jacoUnverified = env.authenticatedContext('jaco', { email: 'jaco@wealthu.org', email_verified: false }).firestore();
const carol = env.authenticatedContext('carol', { email: 'carol@example.com', email_verified: true }).firestore();
const bob = env.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true }).firestore();

await check('email admin lists all members', 'allow', () => getDocs(collection(jaco, 'users')));
await check('role admin lists all members', 'allow', () => getDocs(collection(carol, 'users')));
await check('unverified admin email cannot list members', 'deny', () => getDocs(collection(jacoUnverified, 'users')));
await check('member cannot list members', 'deny', () => getDocs(collection(bob, 'users')));
await check('admin counts all habits', 'allow', () => getCountFromServer(collection(jaco, 'habits')));
await check('admin counts all goals', 'allow', () => getCountFromServer(collection(jaco, 'goals')));
await check('admin counts all transactions', 'allow', () => getCountFromServer(collection(jaco, 'transactions')));
await check('member cannot count all habits', 'deny', () => getCountFromServer(collection(bob, 'habits')));
await check("admin reads a member's habits", 'allow', () => getDocs(query(collection(jaco, 'habits'), where('userId', '==', 'bob'))));
await check("admin counts a member's transactions", 'allow', () => getCountFromServer(query(collection(jaco, 'transactions'), where('userId', '==', 'bob'))));
await check('admin promotes member to admin', 'allow', () => updateDoc(doc(jaco, 'users/bob'), { role: 'admin' }));
await check('admin demotes member back', 'allow', () => updateDoc(doc(jaco, 'users/bob'), { role: 'user' }));
await check("admin cannot edit a member's XP", 'deny', () => updateDoc(doc(jaco, 'users/bob'), { xp: 9999 }));
await check('admin cannot set an unknown role', 'deny', () => updateDoc(doc(jaco, 'users/bob'), { role: 'owner' }));
await check("member cannot change another member's role", 'deny', () => updateDoc(doc(bob, 'users/carol'), { role: 'user' }));
await check('member cannot promote self', 'deny', () => updateDoc(doc(bob, 'users/bob'), { role: 'admin' }));

report();
await env.cleanup();
