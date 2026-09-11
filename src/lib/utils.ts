import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = 'USD') {
  const currencies: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ZAR: 'R',
    AUD: 'A$',
    CAD: 'C$',
    INR: '₹',
    JPY: '¥',
  };

  const symbol = currencies[currencyCode] || '$';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${symbol}${absAmount}`;
}
