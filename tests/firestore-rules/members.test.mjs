// Replays the app's member writes (src/App.tsx, Account.tsx) against the rules.
import { doc, setDoc, getDoc, addDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { setup, checker } from './helpers.mjs';

const env = await setup('demo-wealth-members');
const { check, report, results } = checker();

const alice = env.authenticatedContext('alice', { email: 'alice@example.com', email_verified: false }).firestore();
const bob = env.authenticatedContext('bob', { email: 'bob@example.com', name: 'Bob', email_verified: true }).firestore();
const anon = env.unauthenticatedContext().firestore();

await check('email sign-up creates profile', 'allow', () =>
  setDoc(doc(alice, 'users/alice'), { uid: 'alice', email: 'alice@example.com', role: 'user', xp: 0, level: 1, badges: [], createdAt: serverTimestamp() }));
await check('google sign-up creates profile', 'allow', () =>
  setDoc(doc(bob, 'users/bob'), { uid: 'bob', email: 'bob@example.com', displayName: 'Bob', photoURL: 'https://x/y.png', role: 'user', xp: 0, level: 1, badges: [], createdAt: serverTimestamp() }));
await check('user reads own profile', 'allow', () => getDoc(doc(bob, 'users/bob')));
await check('user cannot read another profile', 'deny', () => getDoc(doc(alice, 'users/bob')));
await check('signed-out visitor cannot read profiles', 'deny', () => getDoc(doc(anon, 'users/bob')));
await check('user cannot make self admin', 'deny', () => setDoc(doc(bob, 'users/bob'), { role: 'admin' }, { merge: true }));

const profile = { displayName: 'Bob', bio: '', incomeRange: 'Select', primaryGoal: 'Select', wealthChallenge: 'Select', enneagramType: 'Select your type', currency: 'ZAR' };
await check('profile save before any photo analysis', 'allow', () => setDoc(doc(bob, 'users/bob'), profile, { merge: true }));
await check('profile save with photo analysis', 'allow', () =>
  setDoc(doc(bob, 'users/bob'), { ...profile, photoAnalysis: { persona: 'P', analysis: 'A', tips: [] } }, { merge: true }));
await check('xp award with increment', 'allow', () => setDoc(doc(bob, 'users/bob'), { xp: increment(10) }, { merge: true }));
await check('repeat login refreshes identity only', 'allow', () =>
  setDoc(doc(bob, 'users/bob'), { uid: 'bob', email: 'bob@example.com', displayName: 'Bob', photoURL: 'https://x/y.png' }, { merge: true }));

const habitRef = await addDoc(collection(bob, 'habits'), { title: 'Read', description: 'd', completedDays: [], streak: 0, userId: 'bob', createdAt: serverTimestamp() }).catch(() => null);
results.push([habitRef ? 'PASS' : 'FAIL', 'create habit']);
if (habitRef) {
  await check('toggle habit (merge)', 'allow', () => setDoc(doc(bob, 'habits', habitRef.id), { completedDays: ['2026-10-17'], streak: 1 }, { merge: true }));
  await check('other user cannot read habit', 'deny', () => getDoc(doc(alice, 'habits', habitRef.id)));
  await check('other user cannot edit habit', 'deny', () => setDoc(doc(alice, 'habits', habitRef.id), { streak: 99 }, { merge: true }));
  await check('other user cannot delete habit', 'deny', () => deleteDoc(doc(alice, 'habits', habitRef.id)));
}
await check('cannot create habit for someone else', 'deny', () => addDoc(collection(alice, 'habits'), { title: 'x', userId: 'bob', createdAt: serverTimestamp() }));
await check('list own habits', 'allow', () => getDocs(query(collection(bob, 'habits'), where('userId', '==', 'bob'))));
await check('list all habits without filter', 'deny', () => getDocs(collection(bob, 'habits')));
await check('list another user habits', 'deny', () => getDocs(query(collection(alice, 'habits'), where('userId', '==', 'bob'))));

const txRef = await addDoc(collection(bob, 'transactions'), { date: '2026-10-17', amount: 100, category: 'Groceries', description: 'x', type: 'expense', userId: 'bob', createdAt: serverTimestamp() }).catch(() => null);
results.push([txRef ? 'PASS' : 'FAIL', 'create transaction']);
if (txRef) await check('delete own transaction', 'allow', () => deleteDoc(doc(bob, 'transactions', txRef.id)));

const goalRef = await addDoc(collection(bob, 'goals'), { title: 'Fund', targetAmount: 1000, currentAmount: 0, deadline: '2027-01-01', category: '1-year', userId: 'bob', createdAt: serverTimestamp() }).catch(() => null);
results.push([goalRef ? 'PASS' : 'FAIL', 'create goal']);
if (goalRef) await check('update goal amount (merge)', 'allow', () => setDoc(doc(bob, 'goals', goalRef.id), { currentAmount: 500 }, { merge: true }));

await check('create gratitude entry', 'allow', () => addDoc(collection(bob, 'gratitude_entries'), { userId: 'bob', date: '2026-10-17', content: 'thanks', createdAt: serverTimestamp() }));
await check('create ritual', 'allow', () => addDoc(collection(bob, 'rituals'), { userId: 'bob', date: '2026-10-17', type: 'review', createdAt: serverTimestamp() }));
const msRef = await addDoc(collection(bob, 'money_story_responses'), { userId: 'bob', questionId: 1, answer: 'a', updatedAt: serverTimestamp() }).catch(() => null);
results.push([msRef ? 'PASS' : 'FAIL', 'create money story answer']);
if (msRef) await check('edit money story answer', 'allow', () => setDoc(doc(bob, 'money_story_responses', msRef.id), { userId: 'bob', questionId: 1, answer: 'b', updatedAt: serverTimestamp() }));

await check('save freedom calculator', 'allow', () => setDoc(doc(bob, 'freedom_calculator/bob'), {
  currency: 'ZAR', monthlyEarnedIncome: 42000, monthlyPassiveIncome: 0, monthlyExpenses: 20000, expenseBuffer: 10,
  assets: { property: 0 }, liabilities: { bond: 0 }, inflationRate: 6, withdrawalRate: 4, freedomGoals: [],
  userId: 'bob', updatedAt: serverTimestamp(),
}, { merge: true }));
await check('other user cannot read freedom calculator', 'deny', () => getDoc(doc(alice, 'freedom_calculator/bob')));

report();
await env.cleanup();
