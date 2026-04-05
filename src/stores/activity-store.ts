'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Activity, ActivityTypeLiteral, CreateInput, UpdateInput } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ActivityFilters {
  searchQuery: string;
  typeFilter: ActivityTypeLiteral | 'all';
  clientFilter: string | 'all';
}

export interface ActivityState {
  activities: Activity[];
  loading: boolean;
  filters: ActivityFilters;
}

export interface ActivityActions {
  setActivities: (activities: Activity[]) => void;
  setLoading: (loading: boolean) => void;
  addActivity: (activity: CreateInput<Activity>) => Activity;
  updateActivity: (id: string, updates: UpdateInput<Activity>) => void;
  deleteActivity: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: ActivityTypeLiteral | 'all') => void;
  setClientFilter: (clientId: string | 'all') => void;
  resetFilters: () => void;
  getFilteredActivities: () => Activity[];
  getActivitiesByClient: (clientId: string) => Activity[];
  getRecentActivities: (limit?: number) => Activity[];
}

export type ActivityStore = ActivityState & ActivityActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: ActivityFilters = {
  searchQuery: '',
  typeFilter: 'all',
  clientFilter: 'all',
};

// ── Store ──────────────────────────────────────────────────────────────────

export const activityStore = createStore<ActivityStore>()((set, get) => ({
  // State
  activities: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setActivities: (activities: Activity[]) =>
    set(() => ({ activities })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addActivity: (input: CreateInput<Activity>): Activity => {
    const activity: Activity = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    } as Activity;
    set((state) => ({ activities: [...state.activities, activity] }));
    return activity;
  },

  updateActivity: (id: string, updates: UpdateInput<Activity>) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    })),

  deleteActivity: (id: string) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setTypeFilter: (type: ActivityTypeLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, typeFilter: type },
    })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, clientFilter: clientId },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredActivities: (): Activity[] => {
    const { activities, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return activities.filter((a) => {
      if (
        query &&
        !a.title.toLowerCase().includes(query) &&
        !(a.description ?? '').toLowerCase().includes(query)
      ) {
        return false;
      }
      if (filters.typeFilter !== 'all' && a.type !== filters.typeFilter) {
        return false;
      }
      if (
        filters.clientFilter !== 'all' &&
        a.clientId !== filters.clientFilter
      ) {
        return false;
      }
      return true;
    });
  },

  getActivitiesByClient: (clientId: string): Activity[] => {
    return get().activities.filter((a) => a.clientId === clientId);
  },

  getRecentActivities: (limit: number = 20): Activity[] => {
    return [...get().activities]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, limit);
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useActivityStore(): ActivityStore;
export function useActivityStore<T>(selector: (state: ActivityStore) => T): T;
export function useActivityStore<T>(selector?: (state: ActivityStore) => T) {
  return useStore(activityStore, selector as (state: ActivityStore) => T);
}
