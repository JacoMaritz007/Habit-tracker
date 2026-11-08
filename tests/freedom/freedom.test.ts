// Acceptance checks for the Freedom Calculator maths. Run: npx tsx tests/freedom/freedom.test.ts
import assert from 'node:assert/strict';
import { freedomNumber, project, MAX_YEARS } from '../../src/lib/freedom';

let passed = 0;
const test = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS  ${name}`); };

const base = { startingCapital: 500_000, monthlyInvestment: 10_000, annualIncrease: 0.05, growthRate: 0.12, inflationRate: 0.06 };
const fn = freedomNumber({ monthlyExpenses: 30_000, expenseBuffer: 0.1, withdrawalRate: 0.04, goalsCost: 0 }).total;

test('Freedom Number = buffered annual expenses ÷ withdrawal rate + goals', () => {
  assert.equal(fn, 30_000 * 1.1 * 12 / 0.04); // 9.9m
  assert.equal(freedomNumber({ monthlyExpenses: 30_000, expenseBuffer: 0.1, withdrawalRate: 0.04, goalsCost: 250_000 }).total, 9_900_000 + 250_000);
  assert.equal(freedomNumber({ monthlyExpenses: 30_000, expenseBuffer: 0, withdrawalRate: 0, goalsCost: 0 }).total, 0);
});

test('already at the target', () => {
  assert.equal(project({ ...base, freedomNumber: fn, startingCapital: fn }).timeToFreedom.status, 'already-free');
  assert.equal(project({ ...base, freedomNumber: fn, startingCapital: fn * 2, monthlyInvestment: 0 }).timeToFreedom.status, 'already-free');
});

test('below the target with positive contributions reaches a date', () => {
  const t = project({ ...base, freedomNumber: fn }).timeToFreedom;
  assert.equal(t.status, 'reached');
  if (t.status !== 'reached') return;
  assert.ok(t.months > 0 && t.months < MAX_YEARS * 12);
  assert.ok(t.balance >= t.target, 'balance meets the inflated target');
  assert.ok(t.target > fn, 'target has grown with inflation');
});

test('reached month is the first month balance >= target', () => {
  const r = project({ ...base, freedomNumber: fn });
  const t = r.timeToFreedom;
  if (t.status !== 'reached') throw new Error('expected reached');
  // Brute-force the month before: balance must still be below the target.
  let bal = base.startingCapital, c = base.monthlyInvestment;
  for (let m = 1; m < t.months; m++) {
    bal = bal * (1 + base.growthRate / 12) + c;
    if (m % 12 === 0) c *= 1 + base.annualIncrease;
    assert.ok(bal < fn * Math.pow(1 + base.inflationRate, m / 12), `month ${m} should be below target`);
  }
});

test('zero contributions with growth above inflation can still reach the target', () => {
  const t = project({ ...base, freedomNumber: fn, monthlyInvestment: 0, startingCapital: 3_000_000 }).timeToFreedom;
  assert.equal(t.status, 'reached');
});

test('zero contributions and growth at or below inflation: not reached, with reason', () => {
  const t = project({ ...base, freedomNumber: fn, monthlyInvestment: 0, growthRate: 0.06 }).timeToFreedom;
  assert.equal(t.status, 'not-reached');
  if (t.status === 'not-reached') assert.match(t.reason, /no monthly investment/i);
});

test('zero assumed growth is respected (not replaced by a default)', () => {
  const r = project({ ...base, freedomNumber: fn, monthlyInvestment: 50_000, growthRate: 0, inflationRate: 0, annualIncrease: 0 });
  // 500k + 50k × 12 per year, no growth: year 1 = 1.1m exactly.
  assert.equal(Math.round(r.yearly[1].balance), 1_100_000);
  const t = r.timeToFreedom;
  assert.equal(t.status, 'reached');
  if (t.status === 'reached') assert.equal(t.months, Math.ceil((fn - 500_000) / 50_000)); // 188 months
});

test('target not reached within the projection period', () => {
  const t = project({ ...base, freedomNumber: fn, monthlyInvestment: 500, startingCapital: 0, growthRate: 0.07 }).timeToFreedom;
  assert.equal(t.status, 'not-reached');
  if (t.status === 'not-reached') { assert.equal(t.maxYears, MAX_YEARS); assert.ok(t.reason.length > 20); }
});

test('no target (no expenses / zero withdrawal rate)', () => {
  assert.equal(project({ ...base, freedomNumber: 0 }).timeToFreedom.status, 'no-target');
});

const months = (over: Partial<typeof base> & { freedomNumber?: number }) => {
  const t = project({ ...base, freedomNumber: fn, ...over }).timeToFreedom;
  return t.status === 'reached' ? t.months : Infinity;
};
test('higher expenses push the date out', () => {
  const higher = freedomNumber({ monthlyExpenses: 40_000, expenseBuffer: 0.1, withdrawalRate: 0.04, goalsCost: 0 }).total;
  assert.ok(months({ freedomNumber: higher }) > months({}));
});
test('higher contributions bring the date in', () => assert.ok(months({ monthlyInvestment: 20_000 }) < months({})));
test('higher annual increase brings the date in', () => assert.ok(months({ annualIncrease: 0.1 }) < months({})));
test('higher growth brings the date in', () => assert.ok(months({ growthRate: 0.15 }) < months({})));
test('higher inflation pushes the date out', () => assert.ok(months({ inflationRate: 0.08 }) > months({})));
test('higher withdrawal rate (smaller target) brings the date in', () => {
  const smaller = freedomNumber({ monthlyExpenses: 30_000, expenseBuffer: 0.1, withdrawalRate: 0.05, goalsCost: 0 }).total;
  assert.ok(months({ freedomNumber: smaller }) < months({}));
});

console.log(`\n${passed} passed`);
