'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  TimeEntry,
  TimeCategoryLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TimerState {
  timerRunning: boolean;
  timerStart: Date | null;
  timerClientId: string | null;
  timerDescription: string;
  timerCategory: TimeCategoryLiteral | null;
}

export interface TimeFilters {
  clientFilter: string | 'all';
  categoryFilter: TimeCategoryLiteral | 'all';
  billableFilter: 'all' | 'billable' | 'non-billable';
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface TimeState {
  timeEntries: TimeEntry[];
  loading: boolean;
  timer: TimerState;
  filters: TimeFilters;
}

export interface TimeActions {
  setTimeEntries: (entries: TimeEntry[]) => void;
  setLoading: (loading: boolean) => void;
  addTimeEntry: (entry: CreateInput<TimeEntry>) => TimeEntry;
  updateTimeEntry: (id: string, updates: UpdateInput<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  startTimer: (
    clientId: string | null,
    description: string,
    category: TimeCategoryLiteral | null,
  ) => void;
  stopTimer: (rate: number, billable?: boolean) => TimeEntry | null;
  updateTimerDescription: (description: string) => void;
  updateTimerCategory: (category: TimeCategoryLiteral | null) => void;
  cancelTimer: () => void;
  setClientFilter: (clientId: string | 'all') => void;
  setCategoryFilter: (category: TimeCategoryLiteral | 'all') => void;
  setBillableFilter: (filter: TimeFilters['billableFilter']) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  resetFilters: () => void;
  getTimeEntriesByClient: (clientId: string) => TimeEntry[];
  getUninvoicedEntries: () => TimeEntry[];
  getFilteredEntries: () => TimeEntry[];
  getTotalHours: (entries?: TimeEntry[]) => number;
  getTotalRevenue: (entries?: TimeEntry[]) => number;
}

export type TimeStore = TimeState & TimeActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultTimer: TimerState = {
  timerRunning: false,
  timerStart: null,
  timerClientId: null,
  timerDescription: '',
  timerCategory: null,
};

const defaultFilters: TimeFilters = {
  clientFilter: 'all',
  categoryFilter: 'all',
  billableFilter: 'all',
  dateFrom: null,
  dateTo: null,
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Round hours to the nearest 15-minute increment (0.25).
 */
function roundToQuarterHour(hours: number): number {
  return Math.round(hours * 4) / 4;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const timeStore = createStore<TimeStore>()((set, get) => ({
  // State
  timeEntries: [],
  loading: false,
  timer: { ...defaultTimer },
  filters: { ...defaultFilters },

  // Actions
  setTimeEntries: (entries: TimeEntry[]) =>
    set(() => ({ timeEntries: entries })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addTimeEntry: (input: CreateInput<TimeEntry>): TimeEntry => {
    const entry: TimeEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    } as TimeEntry;
    set((state) => ({ timeEntries: [...state.timeEntries, entry] }));
    return entry;
  },

  updateTimeEntry: (id: string, updates: UpdateInput<TimeEntry>) =>
    set((state) => ({
      timeEntries: state.timeEntries.map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      ),
    })),

  deleteTimeEntry: (id: string) =>
    set((state) => ({
      timeEntries: state.timeEntries.filter((e) => e.id !== id),
    })),

  startTimer: (
    clientId: string | null,
    description: string,
    category: TimeCategoryLiteral | null,
  ) =>
    set(() => ({
      timer: {
        timerRunning: true,
        timerStart: new Date(),
        timerClientId: clientId,
        timerDescription: description,
        timerCategory: category,
      },
    })),

  stopTimer: (rate: number, billable: boolean = true): TimeEntry | null => {
    const { timer } = get();
    if (!timer.timerRunning || !timer.timerStart) return null;

    const elapsed =
      (new Date().getTime() - new Date(timer.timerStart).getTime()) /
      (1000 * 60 * 60);
    const hours = roundToQuarterHour(Math.max(elapsed, 0.25));

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      clientId: timer.timerClientId,
      description: timer.timerDescription || 'Untitled time entry',
      hours,
      rate,
      date: new Date(timer.timerStart),
      category: timer.timerCategory,
      invoiceId: null,
      billable,
      timerStart: timer.timerStart,
      createdAt: new Date(),
    };

    set((state) => ({
      timeEntries: [...state.timeEntries, entry],
      timer: { ...defaultTimer },
    }));

    return entry;
  },

  updateTimerDescription: (description: string) =>
    set((state) => ({
      timer: { ...state.timer, timerDescription: description },
    })),

  updateTimerCategory: (category: TimeCategoryLiteral | null) =>
    set((state) => ({
      timer: { ...state.timer, timerCategory: category },
    })),

  cancelTimer: () =>
    set(() => ({ timer: { ...defaultTimer } })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, clientFilter: clientId },
    })),

  setCategoryFilter: (category: TimeCategoryLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, categoryFilter: category },
    })),

  setBillableFilter: (filter: TimeFilters['billableFilter']) =>
    set((state) => ({
      filters: { ...state.filters, billableFilter: filter },
    })),

  setDateRange: (from: Date | null, to: Date | null) =>
    set((state) => ({
      filters: { ...state.filters, dateFrom: from, dateTo: to },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getTimeEntriesByClient: (clientId: string): TimeEntry[] => {
    return get().timeEntries.filter((e) => e.clientId === clientId);
  },

  getUninvoicedEntries: (): TimeEntry[] => {
    return get().timeEntries.filter(
      (e) => e.billable && !e.invoiceId,
    );
  },

  getFilteredEntries: (): TimeEntry[] => {
    const { timeEntries, filters } = get();

    return timeEntries.filter((e) => {
      if (
        filters.clientFilter !== 'all' &&
        e.clientId !== filters.clientFilter
      ) {
        return false;
      }
      if (
        filters.categoryFilter !== 'all' &&
        e.category !== filters.categoryFilter
      ) {
        return false;
      }
      if (filters.billableFilter === 'billable' && !e.billable) return false;
      if (filters.billableFilter === 'non-billable' && e.billable)
        return false;
      if (filters.dateFrom && new Date(e.date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(e.date) > new Date(filters.dateTo)) {
        return false;
      }
      return true;
    });
  },

  getTotalHours: (entries?: TimeEntry[]): number => {
    const source = entries ?? get().timeEntries;
    return source.reduce((sum, e) => sum + e.hours, 0);
  },

  getTotalRevenue: (entries?: TimeEntry[]): number => {
    const source = entries ?? get().timeEntries;
    return source.reduce((sum, e) => sum + e.hours * e.rate, 0);
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTimeStore(): TimeStore;
export function useTimeStore<T>(selector: (state: TimeStore) => T): T;
export function useTimeStore<T>(selector?: (state: TimeStore) => T) {
  return useStore(timeStore, selector as (state: TimeStore) => T);
}
