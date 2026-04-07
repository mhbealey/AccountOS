import {
  format,
  parseISO,
  differenceInDays,
  differenceInBusinessDays,
  isValid,
  isBefore,
} from 'date-fns';

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string as "Apr 6, 2026" or return "—" if invalid/empty.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

/**
 * Format a date string as "Apr 6" (no year).
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, 'MMM d');
  } catch {
    return '—';
  }
}

/**
 * Format a date string as relative time: "2d ago", "Today", "Yesterday".
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';

    const now = new Date();
    const days = differenceInDays(now, date);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch {
    return '—';
  }
}

/**
 * Format a duration in minutes as "1h 30m".
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format hours as "8.5h".
 */
export function formatHours(hours: number): string {
  return `${hours}h`;
}

/**
 * Calculate the number of calendar days remaining until a date.
 * Returns negative values for past dates.
 */
export function daysRemaining(dateStr: string): number {
  const date = parseISO(dateStr);
  return differenceInDays(date, new Date());
}

/**
 * Calculate the number of business days remaining until a date.
 * Returns negative values for past dates.
 */
export function businessDaysRemaining(dateStr: string): number {
  const date = parseISO(dateStr);
  return differenceInBusinessDays(date, new Date());
}

/**
 * Check if a date string is in the past.
 */
export function isPast(dateStr: string): boolean {
  const date = parseISO(dateStr);
  return isBefore(date, new Date());
}

/**
 * Get today's date as a YYYY-MM-DD string.
 */
export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get the current time as an ISO timestamp.
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Generate a UUID using crypto.randomUUID with a fallback.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
