'use client';

import { create } from 'zustand';

interface Deal {
  id: string;
  title: string;
  stage: string;
  clientId: string;
  value: number;
  [key: string]: unknown;
}

interface DealFilters {
  stage: string;
  clientId: string;
}

interface DealState {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  filters: DealFilters;
  fetchDeals: () => Promise<void>;
  createDeal: (deal: Omit<Deal, 'id'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  moveDealStage: (id: string, stage: string) => Promise<void>;
}

export const useDealsStore = create<DealState>()((set, get) => ({
  deals: [],
  loading: false,
  error: null,
  filters: { stage: '', clientId: '' },

  fetchDeals: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.stage) params.set('stage', filters.stage);
      if (filters.clientId) params.set('clientId', filters.clientId);
      const res = await fetch(`/api/v1/deals?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch deals');
      const data = await res.json();
      set({ deals: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createDeal: async (deal) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/v1/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal),
      });
      if (!res.ok) throw new Error('Failed to create deal');
      const created = await res.json();
      set((state) => ({ deals: [...state.deals, created], loading: false }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  updateDeal: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update deal');
      const updated = await res.json();
      set((state) => ({
        deals: state.deals.map((d) => (d.id === id ? updated : d)),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  moveDealStage: async (id, stage) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error('Failed to move deal stage');
      const updated = await res.json();
      set((state) => ({
        deals: state.deals.map((d) => (d.id === id ? updated : d)),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
