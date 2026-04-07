'use client';

import { create } from 'zustand';

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  [key: string]: unknown;
}

interface ClientFilters {
  status: string;
  search: string;
  sort: string;
}

interface ClientState {
  clients: Client[];
  selectedClientId: string | null;
  loading: boolean;
  error: string | null;
  filters: ClientFilters;
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  setFilter: (filters: Partial<ClientFilters>) => void;
  setSelectedClient: (id: string | null) => void;
}

export const useClientsStore = create<ClientState>()((set, get) => ({
  clients: [],
  selectedClientId: null,
  loading: false,
  error: null,
  filters: { status: '', search: '', sort: '' },

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      if (filters.sort) params.set('sort', filters.sort);
      const res = await fetch(`/api/v1/clients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      set({ clients: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchClient: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/clients/${id}`);
      if (!res.ok) throw new Error('Failed to fetch client');
      const client = await res.json();
      const { clients } = get();
      const idx = clients.findIndex((c) => c.id === id);
      const updated = idx >= 0
        ? clients.map((c) => (c.id === id ? client : c))
        : [...clients, client];
      set({ clients: updated, selectedClientId: id, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setFilter: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setSelectedClient: (id) => set({ selectedClientId: id }),
}));
