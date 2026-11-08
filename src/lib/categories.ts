// Shared transaction categories. The AI importer must pick from these, and
// every category dropdown uses them, so the dashboard groups spending
// consistently. Older or custom categories still display as-is.

export type CategoryGroup = { group: string; categories: string[] };

export const EXPENSE_GROUPS: CategoryGroup[] = [
  { group: 'Home', categories: ['Rent / Bond', 'Utilities', 'Home Maintenance', 'Household'] },
  { group: 'Food', categories: ['Groceries', 'Dining Out & Takeaways'] },
  { group: 'Transport', categories: ['Fuel', 'Vehicle & Transport'] },
  { group: 'Health', categories: ['Medical & Pharmacy', 'Medical Aid', 'Fitness'] },
  { group: 'Business', categories: ['Office Supplies', 'Software & Subscriptions', 'Business Services', 'Advertising & Marketing'] },
  { group: 'Personal', categories: ['Clothing', 'Personal Care', 'Entertainment', 'Shopping', 'Travel', 'Education', 'Kids & Family', 'Pets', 'Gifts & Donations'] },
  { group: 'Bills', categories: ['Phone & Internet', 'Insurance'] },
  { group: 'Finance', categories: ['Bank Fees', 'Debt Repayments', 'Tax', 'Savings & Investments', 'Cash Withdrawal', 'Transfer Out'] },
  { group: 'Other', categories: ['Other'] },
];

export const INCOME_GROUPS: CategoryGroup[] = [
  { group: 'Income', categories: ['Salary', 'Business Income', 'Freelance', 'Investment Income', 'Rental Income', 'Refund', 'Transfer In', 'Other Income'] },
];

export const EXPENSE_CATEGORIES = EXPENSE_GROUPS.flatMap(g => g.categories);
export const INCOME_CATEGORIES = INCOME_GROUPS.flatMap(g => g.categories);

export const groupsFor = (type: 'income' | 'expense') => (type === 'income' ? INCOME_GROUPS : EXPENSE_GROUPS);
export const defaultCategory = (type: 'income' | 'expense') => (type === 'income' ? 'Other Income' : 'Other');

// Common names the AI or a bank export might use for our categories.
const ALIASES: Record<string, string> = {
  rent: 'Rent / Bond', bond: 'Rent / Bond', mortgage: 'Rent / Bond', housing: 'Rent / Bond',
  electricity: 'Utilities', water: 'Utilities', utility: 'Utilities',
  restaurant: 'Dining Out & Takeaways', restaurants: 'Dining Out & Takeaways', 'dining out': 'Dining Out & Takeaways', takeaway: 'Dining Out & Takeaways', takeaways: 'Dining Out & Takeaways', food: 'Groceries',
  petrol: 'Fuel', gas: 'Fuel', transport: 'Vehicle & Transport', transportation: 'Vehicle & Transport', uber: 'Vehicle & Transport', parking: 'Vehicle & Transport', car: 'Vehicle & Transport',
  healthcare: 'Medical & Pharmacy', health: 'Medical & Pharmacy', medical: 'Medical & Pharmacy', pharmacy: 'Medical & Pharmacy', doctor: 'Medical & Pharmacy', 'medical expenses': 'Medical & Pharmacy', 'medical aid': 'Medical Aid', gym: 'Fitness',
  'office': 'Office Supplies', stationery: 'Office Supplies', software: 'Software & Subscriptions', subscriptions: 'Software & Subscriptions', subscription: 'Software & Subscriptions', marketing: 'Advertising & Marketing', advertising: 'Advertising & Marketing',
  clothes: 'Clothing', beauty: 'Personal Care', haircut: 'Personal Care', streaming: 'Entertainment', school: 'Education', 'school fees': 'Education', kids: 'Kids & Family', donations: 'Gifts & Donations', gifts: 'Gifts & Donations', charity: 'Gifts & Donations',
  phone: 'Phone & Internet', internet: 'Phone & Internet', airtime: 'Phone & Internet', data: 'Phone & Internet', cellphone: 'Phone & Internet',
  fees: 'Bank Fees', 'bank charges': 'Bank Fees', 'service fee': 'Bank Fees', loan: 'Debt Repayments', 'credit card': 'Debt Repayments', debt: 'Debt Repayments', taxes: 'Tax', sars: 'Tax',
  savings: 'Savings & Investments', investment: 'Savings & Investments', investments: 'Savings & Investments', atm: 'Cash Withdrawal', cash: 'Cash Withdrawal', transfer: 'Transfer Out',
  wages: 'Salary', payroll: 'Salary', income: 'Other Income', 'business': 'Business Income', interest: 'Investment Income', dividends: 'Investment Income', dividend: 'Investment Income', refunds: 'Refund',
};

// Maps any incoming category name onto the shared list for its type.
export function normalizeCategory(raw: string | undefined, type: 'income' | 'expense'): string {
  const allowed = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const name = (raw || '').trim();
  if (!name) return defaultCategory(type);
  const exact = allowed.find(c => c.toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  const alias = ALIASES[name.toLowerCase()];
  if (alias && allowed.includes(alias)) return alias;
  if (type === 'income' && alias === 'Transfer Out') return 'Transfer In';
  return defaultCategory(type);
}

export const categoryListForPrompt = () =>
  `Expense categories: ${EXPENSE_CATEGORIES.join(', ')}.\nIncome categories: ${INCOME_CATEGORIES.join(', ')}.`;
