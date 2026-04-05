import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

/**
 * Merge class names with Tailwind CSS conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date as "MMM d, yyyy" (e.g., "Jan 5, 2026").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format a date with time as "MMM d, yyyy h:mm a" (e.g., "Jan 5, 2026 3:30 PM").
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 days", "just now").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();

  const daysDiff = differenceInDays(d, now);
  const hoursDiff = differenceInHours(d, now);
  const minutesDiff = differenceInMinutes(d, now);

  // Future dates
  if (daysDiff > 0) {
    if (daysDiff === 1) return 'in 1 day';
    return `in ${daysDiff} days`;
  }

  if (hoursDiff > 0) {
    if (hoursDiff === 1) return 'in 1 hour';
    return `in ${hoursDiff} hours`;
  }

  if (minutesDiff > 0) {
    if (minutesDiff === 1) return 'in 1 minute';
    return `in ${minutesDiff} minutes`;
  }

  // Past dates
  const absDays = Math.abs(daysDiff);
  const absHours = Math.abs(hoursDiff);
  const absMinutes = Math.abs(minutesDiff);

  if (absDays > 0) {
    if (absDays === 1) return '1 day ago';
    return `${absDays} days ago`;
  }

  if (absHours > 0) {
    if (absHours === 1) return '1 hour ago';
    return `${absHours} hours ago`;
  }

  if (absMinutes > 0) {
    if (absMinutes === 1) return '1 minute ago';
    return `${absMinutes} minutes ago`;
  }

  return 'just now';
}

/**
 * Generate a new unique identifier using crypto.randomUUID().
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get a Tailwind CSS color class based on a health score (0-100).
 *
 * - 0-30: red (critical)
 * - 31-60: yellow (at risk)
 * - 61-80: green (healthy)
 * - 81-100: blue (thriving)
 */
export function getHealthColor(score: number): string {
  if (score <= 30) return 'text-red-600';
  if (score <= 60) return 'text-yellow-600';
  if (score <= 80) return 'text-green-600';
  return 'text-blue-600';
}

/**
 * Get a human-readable health label for a score (0-100).
 */
export function getHealthLabel(score: number): string {
  if (score <= 30) return 'Critical';
  if (score <= 60) return 'At-Risk';
  if (score <= 80) return 'Healthy';
  return 'Thriving';
}

/**
 * Get Tailwind CSS background + text color classes for a client status.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Prospect':
      return 'bg-slate-100 text-slate-700';
    case 'Onboarding':
      return 'bg-blue-100 text-blue-700';
    case 'Active':
      return 'bg-green-100 text-green-700';
    case 'At-Risk':
      return 'bg-yellow-100 text-yellow-700';
    case 'Paused':
      return 'bg-orange-100 text-orange-700';
    case 'Churned':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Get the default win probability for a given pipeline stage.
 */
export function getStageProbability(stage: string): number {
  switch (stage) {
    case 'Lead':
      return 10;
    case 'Discovery':
      return 25;
    case 'Proposal':
      return 50;
    case 'Negotiation':
      return 75;
    case 'ClosedWon':
      return 100;
    case 'ClosedLost':
      return 0;
    default:
      return 0;
  }
}

/**
 * Sanitize a string by escaping HTML entities to prevent XSS.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Create a debounced version of a function that delays invocation
 * until `delay` milliseconds have elapsed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  return debounced as unknown as T;
}
