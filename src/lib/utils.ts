import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

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

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const days = differenceInDays(now, d);
  if (days > 0) return days === 1 ? '1d ago' : `${days}d ago`;
  const hours = differenceInHours(now, d);
  if (hours > 0) return `${hours}h ago`;
  const mins = differenceInMinutes(now, d);
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export function getHealthColor(score: number): string {
  if (score <= 30) return 'text-red-500';
  if (score <= 60) return 'text-yellow-500';
  if (score <= 80) return 'text-emerald-500';
  return 'text-blue-500';
}

export function getHealthBg(score: number): string {
  if (score <= 30) return 'bg-red-500';
  if (score <= 60) return 'bg-yellow-500';
  if (score <= 80) return 'bg-emerald-500';
  return 'bg-blue-500';
}

export function getHealthLabel(score: number): string {
  if (score <= 30) return 'Critical';
  if (score <= 60) return 'At-Risk';
  if (score <= 80) return 'Healthy';
  return 'Thriving';
}

export function getStageProbability(stage: string): number {
  const map: Record<string, number> = {
    Lead: 10, Discovery: 25, Proposal: 50, Negotiation: 75, 'Closed Won': 100, 'Closed Lost': 0,
  };
  return map[stage] ?? 0;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Onboarding: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'At-Risk': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Paused: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Churned: 'bg-red-500/10 text-red-500 border-red-500/20',
    Prospect: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return map[status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    Urgent: 'text-red-500',
    High: 'text-orange-500',
    Medium: 'text-yellow-500',
    Low: 'text-slate-400',
  };
  return map[priority] ?? 'text-slate-400';
}

export function getSentimentColor(sentiment: string | null): string {
  if (!sentiment) return 'text-slate-400';
  const map: Record<string, string> = {
    Positive: 'text-emerald-500',
    Neutral: 'text-slate-400',
    Negative: 'text-red-500',
  };
  return map[sentiment] ?? 'text-slate-400';
}
