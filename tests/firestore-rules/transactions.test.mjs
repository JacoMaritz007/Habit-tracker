// Editing and recategorising transactions (src/components/Transactions.tsx).
import { doc, setDoc, updateDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { setup, checker } from './helpers.mjs';

const env = await setup('demo-wealth-transactions');
const { check, report } = checker();
const old = Timestamp.fromDate(new Date(Date.now() - 30 * 864e5));
await env.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore();
  for (const [id, userId] of [['t1', 'bob'], ['t2', 'bob'], ['t3', 'bob'], ['a1', 'alice']])
    await setDoc(doc(db, 'transactions', id), { userId, date: '2026-10-01', amount: 120, category: 'Other', description: 'CLICKS PHARMACY 1234', type: 'expense', createdAt: old });
});
const bob = env.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true }).firestore();
const alice = env.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true }).firestore();
await check('change own transaction category', 'allow', () => updateDoc(doc(bob, 'transactions/t1'), { category: 'Medical & Pharmacy', updatedAt: serverTimestamp() }));
await check('full edit of own transaction', 'allow', () => updateDoc(doc(bob, 'transactions/t1'), { date: '2026-10-02', amount: 99.5, description: 'Clicks', type: 'expense', category: 'Medical & Pharmacy', updatedAt: serverTimestamp() }));
await check('bulk recategorise own transactions', 'allow', () => { const b = writeBatch(bob); ['t2', 't3'].forEach(id => b.update(doc(bob, 'transactions', id), { category: 'Medical & Pharmacy', updatedAt: serverTimestamp() })); return b.commit(); });
await check("cannot edit another member's transaction", 'deny', () => updateDoc(doc(bob, 'transactions/a1'), { category: 'Tax' }));
await check('bulk edit including another member is rejected', 'deny', () => { const b = writeBatch(bob); ['t2', 'a1'].forEach(id => b.update(doc(bob, 'transactions', id), { category: 'Tax', updatedAt: serverTimestamp() })); return b.commit(); });
await check('cannot move transaction to another member', 'deny', () => updateDoc(doc(bob, 'transactions/t1'), { userId: 'alice' }));
await check('cannot set an invalid type', 'deny', () => updateDoc(doc(bob, 'transactions/t1'), { type: 'transfer' }));
await check('cannot make amount text', 'deny', () => updateDoc(doc(bob, 'transactions/t1'), { amount: '100' }));
await check('bulk delete own transactions', 'allow', () => { const b = writeBatch(bob); ['t2', 't3'].forEach(id => b.delete(doc(bob, 'transactions', id))); return b.commit(); });
await check("cannot delete another member's transaction", 'deny', () => { const b = writeBatch(alice); b.delete(doc(alice, 'transactions', 't1')); return b.commit(); });
report();
await env.cleanup();
