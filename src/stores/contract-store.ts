'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Contract, ContractStatusLiteral, CreateInput, UpdateInput } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ContractFilters {
  searchQuery: string;
  statusFilter: ContractStatusLiteral | 'all';
  clientFilter: string | 'all';
}

export interface ContractState {
  contracts: Contract[];
  loading: boolean;
  filters: ContractFilters;
}

export interface ContractActions {
  setContracts: (contracts: Contract[]) => void;
  setLoading: (loading: boolean) => void;
  addContract: (contract: CreateInput<Contract>) => Contract;
  updateContract: (id: string, updates: UpdateInput<Contract>) => void;
  deleteContract: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ContractStatusLiteral | 'all') => void;
  setClientFilter: (clientId: string | 'all') => void;
  resetFilters: () => void;
  getFilteredContracts: () => Contract[];
  getContractsByClient: (clientId: string) => Contract[];
  getExpiringContracts: (daysAhead: number) => Contract[];
  getActiveContracts: () => Contract[];
}

export type ContractStore = ContractState & ContractActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: ContractFilters = {
  searchQuery: '',
  statusFilter: 'all',
  clientFilter: 'all',
};

// ── Store ──────────────────────────────────────────────────────────────────

export const contractStore = createStore<ContractStore>()((set, get) => ({
  // State
  contracts: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setContracts: (contracts: Contract[]) =>
    set(() => ({ contracts })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addContract: (input: CreateInput<Contract>): Contract => {
    const now = new Date();
    const contract: Contract = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Contract;
    set((state) => ({ contracts: [...state.contracts, contract] }));
    return contract;
  },

  updateContract: (id: string, updates: UpdateInput<Contract>) =>
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
      ),
    })),

  deleteContract: (id: string) =>
    set((state) => ({
      contracts: state.contracts.filter((c) => c.id !== id),
    })),

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setStatusFilter: (status: ContractStatusLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, statusFilter: status },
    })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, clientFilter: clientId },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredContracts: (): Contract[] => {
    const { contracts, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return contracts.filter((c) => {
      if (query && !c.title.toLowerCase().includes(query)) return false;
      if (
        filters.statusFilter !== 'all' &&
        c.status !== filters.statusFilter
      ) {
        return false;
      }
      if (
        filters.clientFilter !== 'all' &&
        c.clientId !== filters.clientFilter
      ) {
        return false;
      }
      return true;
    });
  },

  getContractsByClient: (clientId: string): Contract[] => {
    return get().contracts.filter((c) => c.clientId === clientId);
  },

  getExpiringContracts: (daysAhead: number): Contract[] => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return get().contracts.filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      return end >= now && end <= cutoff;
    });
  },

  getActiveContracts: (): Contract[] => {
    return get().contracts.filter((c) => c.status === 'Active');
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useContractStore(): ContractStore;
export function useContractStore<T>(selector: (state: ContractStore) => T): T;
export function useContractStore<T>(selector?: (state: ContractStore) => T) {
  return useStore(contractStore, selector as (state: ContractStore) => T);
}
