import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function getScoreColor(score: number): string {
  if (score <= 25) return 'text-red-500';
  if (score <= 50) return 'text-amber-500';
  if (score <= 75) return 'text-teal-500';
  return 'text-teal-300';
}

export function getScoreLabel(score: number): string {
  if (score <= 25) return 'Critical';
  if (score <= 50) return 'Developing';
  if (score <= 75) return 'Established';
  return 'Advanced';
}

export function getScoreBg(score: number): string {
  if (score <= 25) return 'bg-red-500/20 text-red-500';
  if (score <= 50) return 'bg-amber-500/20 text-amber-500';
  if (score <= 75) return 'bg-teal-500/20 text-teal-500';
  return 'bg-teal-300/20 text-teal-300';
}
