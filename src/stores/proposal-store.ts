'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Proposal,
  ProposalDeliverable,
  ProposalStatusLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProposalFilters {
  searchQuery: string;
  statusFilter: ProposalStatusLiteral | 'all';
  clientFilter: string | 'all';
}

export interface ProposalState {
  proposals: Proposal[];
  loading: boolean;
  filters: ProposalFilters;
}

export interface ProposalActions {
  setProposals: (proposals: Proposal[]) => void;
  setLoading: (loading: boolean) => void;
  addProposal: (
    proposal: CreateInput<Proposal>,
    deliverables?: CreateInput<ProposalDeliverable>[],
  ) => Proposal;
  updateProposal: (id: string, updates: UpdateInput<Proposal>) => void;
  deleteProposal: (id: string) => void;
  addDeliverable: (deliverable: CreateInput<ProposalDeliverable>) => ProposalDeliverable;
  updateDeliverable: (id: string, updates: UpdateInput<ProposalDeliverable>) => void;
  deleteDeliverable: (id: string) => void;
  checkExpiredProposals: () => string[];
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ProposalStatusLiteral | 'all') => void;
  setClientFilter: (clientId: string | 'all') => void;
  resetFilters: () => void;
  getFilteredProposals: () => Proposal[];
  getProposalsByClient: (clientId: string) => Proposal[];
}

export type ProposalStore = ProposalState & ProposalActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: ProposalFilters = {
  searchQuery: '',
  statusFilter: 'all',
  clientFilter: 'all',
};

// ── Store ──────────────────────────────────────────────────────────────────

export const proposalStore = createStore<ProposalStore>()((set, get) => ({
  // State
  proposals: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setProposals: (proposals: Proposal[]) =>
    set(() => ({ proposals })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addProposal: (
    input: CreateInput<Proposal>,
    deliverables?: CreateInput<ProposalDeliverable>[],
  ): Proposal => {
    const now = new Date();
    const proposalId = crypto.randomUUID();

    const newDeliverables: ProposalDeliverable[] = (deliverables ?? []).map(
      (d, idx) => ({
        ...d,
        id: crypto.randomUUID(),
        proposalId,
        sortOrder: d.sortOrder ?? idx,
      } as ProposalDeliverable),
    );

    const proposal: Proposal = {
      ...input,
      id: proposalId,
      deliverables: newDeliverables,
      createdAt: now,
      updatedAt: now,
    } as Proposal;

    set((state) => ({ proposals: [...state.proposals, proposal] }));
    return proposal;
  },

  updateProposal: (id: string, updates: UpdateInput<Proposal>) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p,
      ),
    })),

  deleteProposal: (id: string) =>
    set((state) => ({
      proposals: state.proposals.filter((p) => p.id !== id),
    })),

  addDeliverable: (input: CreateInput<ProposalDeliverable>): ProposalDeliverable => {
    const deliverable: ProposalDeliverable = {
      ...input,
      id: crypto.randomUUID(),
    } as ProposalDeliverable;

    set((state) => ({
      proposals: state.proposals.map((p) => {
        if (p.id !== deliverable.proposalId) return p;
        return {
          ...p,
          deliverables: [...(p.deliverables ?? []), deliverable],
          updatedAt: new Date(),
        };
      }),
    }));

    return deliverable;
  },

  updateDeliverable: (id: string, updates: UpdateInput<ProposalDeliverable>) =>
    set((state) => ({
      proposals: state.proposals.map((p) => {
        const deliverablesArr = p.deliverables ?? [];
        const hasDeliverable = deliverablesArr.some((d) => d.id === id);
        if (!hasDeliverable) return p;
        return {
          ...p,
          deliverables: deliverablesArr.map((d) =>
            d.id === id ? { ...d, ...updates } : d,
          ),
          updatedAt: new Date(),
        };
      }),
    })),

  deleteDeliverable: (id: string) =>
    set((state) => ({
      proposals: state.proposals.map((p) => {
        const deliverablesArr = p.deliverables ?? [];
        const hasDeliverable = deliverablesArr.some((d) => d.id === id);
        if (!hasDeliverable) return p;
        return {
          ...p,
          deliverables: deliverablesArr.filter((d) => d.id !== id),
          updatedAt: new Date(),
        };
      }),
    })),

  checkExpiredProposals: (): string[] => {
    const now = new Date();
    const expiredIds: string[] = [];

    set((state) => ({
      proposals: state.proposals.map((p) => {
        if (
          (p.status === 'Draft' || p.status === 'Sent') &&
          p.validUntil &&
          new Date(p.validUntil) < now
        ) {
          expiredIds.push(p.id);
          return {
            ...p,
            status: 'Expired' as ProposalStatusLiteral,
            updatedAt: now,
          };
        }
        return p;
      }),
    }));

    return expiredIds;
  },

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setStatusFilter: (status: ProposalStatusLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, statusFilter: status },
    })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, clientFilter: clientId },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredProposals: (): Proposal[] => {
    const { proposals, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return proposals.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query)) return false;
      if (
        filters.statusFilter !== 'all' &&
        p.status !== filters.statusFilter
      ) {
        return false;
      }
      if (
        filters.clientFilter !== 'all' &&
        p.clientId !== filters.clientFilter
      ) {
        return false;
      }
      return true;
    });
  },

  getProposalsByClient: (clientId: string): Proposal[] => {
    return get().proposals.filter((p) => p.clientId === clientId);
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useProposalStore(): ProposalStore;
export function useProposalStore<T>(selector: (state: ProposalStore) => T): T;
export function useProposalStore<T>(selector?: (state: ProposalStore) => T) {
  return useStore(proposalStore, selector as (state: ProposalStore) => T);
}
