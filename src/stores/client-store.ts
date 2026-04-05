'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Client,
  ClientStatusLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ClientFilters {
  searchQuery: string;
  statusFilter: ClientStatusLiteral | 'all';
  industryFilter: string | 'all';
  healthFilter: 'all' | 'critical' | 'at-risk' | 'healthy' | 'thriving';
}

export interface ClientState {
  clients: Client[];
  loading: boolean;
  selectedClientId: string | null;
  filters: ClientFilters;
}

export interface ClientActions {
  setClients: (clients: Client[]) => void;
  setLoading: (loading: boolean) => void;
  addClient: (client: CreateInput<Client>) => Client;
  updateClient: (id: string, updates: UpdateInput<Client>) => void;
  deleteClient: (id: string) => void;
  setSelectedClient: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ClientStatusLiteral | 'all') => void;
  setIndustryFilter: (industry: string | 'all') => void;
  setHealthFilter: (filter: ClientFilters['healthFilter']) => void;
  resetFilters: () => void;
  getFilteredClients: () => Client[];
}

export type ClientStore = ClientState & ClientActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: ClientFilters = {
  searchQuery: '',
  statusFilter: 'all',
  industryFilter: 'all',
  healthFilter: 'all',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesHealthFilter(
  score: number,
  filter: ClientFilters['healthFilter'],
): boolean {
  switch (filter) {
    case 'critical':
      return score <= 30;
    case 'at-risk':
      return score > 30 && score <= 60;
    case 'healthy':
      return score > 60 && score <= 80;
    case 'thriving':
      return score > 80;
    default:
      return true;
  }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const clientStore = createStore<ClientStore>()((set, get) => ({
  // State
  clients: [],
  loading: false,
  selectedClientId: null,
  filters: { ...defaultFilters },

  // Actions
  setClients: (clients: Client[]) =>
    set(() => ({ clients })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addClient: (input: CreateInput<Client>): Client => {
    const now = new Date();
    const client: Client = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Client;
    set((state) => ({ clients: [...state.clients, client] }));
    return client;
  },

  updateClient: (id: string, updates: UpdateInput<Client>) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
      ),
    })),

  deleteClient: (id: string) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
      selectedClientId:
        state.selectedClientId === id ? null : state.selectedClientId,
    })),

  setSelectedClient: (id: string | null) =>
    set(() => ({ selectedClientId: id })),

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setStatusFilter: (status: ClientStatusLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, statusFilter: status },
    })),

  setIndustryFilter: (industry: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, industryFilter: industry },
    })),

  setHealthFilter: (filter: ClientFilters['healthFilter']) =>
    set((state) => ({
      filters: { ...state.filters, healthFilter: filter },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredClients: (): Client[] => {
    const { clients, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return clients.filter((c) => {
      if (
        query &&
        !c.name.toLowerCase().includes(query) &&
        !(c.industry ?? '').toLowerCase().includes(query)
      ) {
        return false;
      }
      if (filters.statusFilter !== 'all' && c.status !== filters.statusFilter) {
        return false;
      }
      if (
        filters.industryFilter !== 'all' &&
        c.industry !== filters.industryFilter
      ) {
        return false;
      }
      if (!matchesHealthFilter(c.healthScore, filters.healthFilter)) {
        return false;
      }
      return true;
    });
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useClientStore(): ClientStore;
export function useClientStore<T>(selector: (state: ClientStore) => T): T;
export function useClientStore<T>(selector?: (state: ClientStore) => T) {
  return useStore(clientStore, selector as (state: ClientStore) => T);
}
