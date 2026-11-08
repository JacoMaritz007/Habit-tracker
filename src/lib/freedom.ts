// Freedom Calculator maths, kept free of React so it can be tested and
// checked against a reference spreadsheet.
//
// Definitions
// - Freedom Number (today's money): the capital whose withdrawals cover your
//   buffered living costs, plus once-off freedom goals:
//     (monthly expenses × (1 + buffer) × 12) ÷ withdrawal rate + goals
// - Eligible capital: the "Starting Capital" entered in the Wealth Plan
//   (investable money). It is not the same as net worth, which can include a
//   home or business that won't fund withdrawals.
//
// Assumptions (all shown to the member as "projected")
// - Growth: the target average return, compounded monthly (rate ÷ 12).
// - Contributions: added at the end of each month; they rise by the annual
//   contribution increase at the start of each new year.
// - Inflation: the Freedom Number grows with inflation, so capital is
//   compared with what freedom will cost in that year, not today.
// - Projection period: up to MAX_YEARS; past that it reports "not reached"
//   rather than a misleading date.

export const MAX_YEARS = 50;

export type FreedomTargetInputs = {
  monthlyExpenses: number;
  expenseBuffer: number;   // 0.1 = 10%
  withdrawalRate: number;  // 0.04 = 4%
  goalsCost: number;
};

export function freedomNumber({ monthlyExpenses, expenseBuffer, withdrawalRate, goalsCost }: FreedomTargetInputs) {
  const buffered = Math.max(0, monthlyExpenses) * (1 + Math.max(0, expenseBuffer));
  const retirementCapital = withdrawalRate > 0 ? (buffered * 12) / withdrawalRate : 0;
  return { bufferedMonthlyExpenses: buffered, retirementCapital, total: retirementCapital + Math.max(0, goalsCost) };
}

export type ProjectionInputs = {
  freedomNumber: number;     // today's money
  startingCapital: number;
  monthlyInvestment: number;
  annualIncrease: number;    // 0.05 = contributions rise 5% a year
  growthRate: number;        // 0.12 = 12% a year
  inflationRate: number;     // 0.06 = 6% a year
  maxYears?: number;
};

export type YearPoint = { year: number; balance: number; target: number };

export type TimeToFreedom =
  | { status: 'no-target'; reason: string }
  | { status: 'already-free' }
  | { status: 'reached'; months: number; years: number; extraMonths: number; balance: number; target: number }
  | { status: 'not-reached'; maxYears: number; balance: number; target: number; reason: string };

export function project(inputs: ProjectionInputs): { yearly: YearPoint[]; timeToFreedom: TimeToFreedom } {
  const maxYears = inputs.maxYears ?? MAX_YEARS;
  const g = inputs.growthRate / 12;
  const target = (months: number) => inputs.freedomNumber * Math.pow(1 + inputs.inflationRate, months / 12);

  let balance = inputs.startingCapital;
  let contribution = Math.max(0, inputs.monthlyInvestment);
  const yearly: YearPoint[] = [{ year: 0, balance, target: inputs.freedomNumber }];
  let reachedAt: number | null = null;
  let reachedBalance = 0;

  for (let m = 1; m <= maxYears * 12; m++) {
    balance = balance * (1 + g) + contribution;
    if (reachedAt === null && inputs.freedomNumber > 0 && balance >= target(m)) {
      reachedAt = m;
      reachedBalance = balance;
    }
    if (m % 12 === 0) {
      yearly.push({ year: m / 12, balance, target: target(m) });
      contribution *= 1 + inputs.annualIncrease;
    }
  }

  let timeToFreedom: TimeToFreedom;
  if (!(inputs.freedomNumber > 0)) {
    timeToFreedom = { status: 'no-target', reason: 'Add your monthly expenses and a withdrawal rate above 0% to set a Freedom Number.' };
  } else if (inputs.startingCapital >= inputs.freedomNumber) {
    timeToFreedom = { status: 'already-free' };
  } else if (reachedAt !== null) {
    timeToFreedom = {
      status: 'reached',
      months: reachedAt,
      years: Math.floor(reachedAt / 12),
      extraMonths: reachedAt % 12,
      balance: reachedBalance,
      target: target(reachedAt),
    };
  } else {
    const end = yearly[yearly.length - 1];
    timeToFreedom = { status: 'not-reached', maxYears, balance: end.balance, target: end.target, reason: notReachedReason(inputs) };
  }
  return { yearly, timeToFreedom };
}

function notReachedReason(i: ProjectionInputs) {
  if (i.monthlyInvestment <= 0 && i.growthRate <= i.inflationRate) {
    return 'With no monthly investment and growth at or below inflation, your capital can’t catch up with the rising cost of freedom.';
  }
  if (i.monthlyInvestment <= 0) {
    return 'Growth alone isn’t enough within the projection period. Adding a monthly investment would bring the date into range.';
  }
  if (i.growthRate <= i.inflationRate) {
    return 'Your assumed growth is at or below inflation, so the target rises as fast as your capital. Increase contributions or review your growth assumption.';
  }
  return 'At this monthly investment and growth rate the target isn’t reached within the projection period. Try investing more each month, increasing contributions yearly, or lowering expenses.';
}

export function formatDuration(t: TimeToFreedom) {
  if (t.status !== 'reached') return null;
  const y = t.years ? `${t.years} yr${t.years === 1 ? '' : 's'}` : '';
  const m = t.extraMonths ? `${t.extraMonths} mo${t.extraMonths === 1 ? '' : 's'}` : '';
  return [y, m].filter(Boolean).join(' ') || 'Under a month';
}
