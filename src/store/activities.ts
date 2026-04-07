'use client';

import { create } from 'zustand';

interface Activity {
  id: string;
  type: string;
  description: string;
  clientId: string;
  createdAt: string;
  [key: string]: unknown;
}

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  logActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
}

export const useActivitiesStore = create<ActivityState>()((set) => ({
  activities: [],
  loading: false,
  error: null,

  fetchActivities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/v1/activities');
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();
      set({ activities: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  logActivity: async (activity) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/v1/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      if (!res.ok) throw new Error('Failed to log activity');
      const created = await res.json();
      set((state) => ({
        activities: [created, ...state.activities],
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
