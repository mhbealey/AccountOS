'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Deal,
  StageChange,
  DealStageLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';
import { getStageProbability } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

export type DealSortField = 'value' | 'closeDate' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface DealFilters {
  searchQuery: string;
  stageFilter: DealStageLiteral | 'all';
  clientFilter: string | 'all';
  sortField: DealSortField;
  sortDirection: SortDirection;
}

export interface DealState {
  deals: Deal[];
  stageChanges: StageChange[];
  loading: boolean;
  selectedDealId: string | null;
  filters: DealFilters;
}

export interface DealActions {
  setDeals: (deals: Deal[]) => void;
  setStageChanges: (changes: StageChange[]) => void;
  setLoading: (loading: boolean) => void;
  addDeal: (deal: CreateInput<Deal>) => Deal;
  updateDeal: (id: string, updates: UpdateInput<Deal>) => void;
  deleteDeal: (id: string) => void;
  setSelectedDeal: (id: string | null) => void;
  moveDealToStage: (dealId: string, toStage: DealStageLiteral, notes?: string) => void;
  setSearchQuery: (query: string) => void;
  setStageFilter: (stage: DealStageLiteral | 'all') => void;
  setClientFilter: (clientId: string | 'all') => void;
  setSortField: (field: DealSortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  getDealsByStage: (stage: DealStageLiteral) => Deal[];
  getFilteredDeals: () => Deal[];
  getPipelineValue: () => number;
  getWeightedPipelineValue: () => number;
}

export type DealStore = DealState & DealActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: DealFilters = {
  searchQuery: '',
  stageFilter: 'all',
  clientFilter: 'all',
  sortField: 'createdAt',
  sortDirection: 'desc',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function compareDealField(a: Deal, b: Deal, field: DealSortField): number {
  switch (field) {
    case 'value':
      return a.value - b.value;
    case 'title':
      return a.title.localeCompare(b.title);
    case 'closeDate': {
      const aTime = a.closeDate ? new Date(a.closeDate).getTime() : 0;
      const bTime = b.closeDate ? new Date(b.closeDate).getTime() : 0;
      return aTime - bTime;
    }
    case 'createdAt':
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    default:
      return 0;
  }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const dealStore = createStore<DealStore>()((set, get) => ({
  // State
  deals: [],
  stageChanges: [],
  loading: false,
  selectedDealId: null,
  filters: { ...defaultFilters },

  // Actions
  setDeals: (deals: Deal[]) =>
    set(() => ({ deals })),

  setStageChanges: (changes: StageChange[]) =>
    set(() => ({ stageChanges: changes })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addDeal: (input: CreateInput<Deal>): Deal => {
    const now = new Date();
    const deal: Deal = {
      ...input,
      id: crypto.randomUUID(),
      probability: input.probability ?? getStageProbability(input.stage),
      createdAt: now,
      updatedAt: now,
    } as Deal;
    set((state) => ({ deals: [...state.deals, deal] }));
    return deal;
  },

  updateDeal: (id: string, updates: UpdateInput<Deal>) =>
    set((state) => ({
      deals: state.deals.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d,
      ),
    })),

  deleteDeal: (id: string) =>
    set((state) => ({
      deals: state.deals.filter((d) => d.id !== id),
      stageChanges: state.stageChanges.filter((sc) => sc.dealId !== id),
      selectedDealId:
        state.selectedDealId === id ? null : state.selectedDealId,
    })),

  setSelectedDeal: (id: string | null) =>
    set(() => ({ selectedDealId: id })),

  moveDealToStage: (
    dealId: string,
    toStage: DealStageLiteral,
    notes?: string,
  ) =>
    set((state) => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal || deal.stage === toStage) return state;

      const stageChange: StageChange = {
        id: crypto.randomUUID(),
        dealId,
        fromStage: deal.stage,
        toStage,
        changedAt: new Date(),
        notes: notes ?? null,
      };

      const now = new Date();
      const updatedDeal: Deal = {
        ...deal,
        stage: toStage,
        probability: getStageProbability(toStage),
        actualCloseDate:
          toStage === 'ClosedWon' || toStage === 'ClosedLost' ? now : deal.actualCloseDate,
        updatedAt: now,
      };

      return {
        deals: state.deals.map((d) => (d.id === dealId ? updatedDeal : d)),
        stageChanges: [...state.stageChanges, stageChange],
      };
    }),

  setSearchQuery: (query: string) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  setStageFilter: (stage: DealStageLiteral | 'all') =>
    set((state) => ({ filters: { ...state.filters, stageFilter: stage } })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({ filters: { ...state.filters, clientFilter: clientId } })),

  setSortField: (field: DealSortField) =>
    set((state) => ({ filters: { ...state.filters, sortField: field } })),

  setSortDirection: (direction: SortDirection) =>
    set((state) => ({ filters: { ...state.filters, sortDirection: direction } })),

  getDealsByStage: (stage: DealStageLiteral): Deal[] => {
    return get().deals.filter((d) => d.stage === stage);
  },

  getFilteredDeals: (): Deal[] => {
    const { deals, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    const filtered = deals.filter((d) => {
      if (query && !d.title.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.stageFilter !== 'all' && d.stage !== filters.stageFilter) {
        return false;
      }
      if (filters.clientFilter !== 'all' && d.clientId !== filters.clientFilter) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const cmp = compareDealField(a, b, filters.sortField);
      return filters.sortDirection === 'asc' ? cmp : -cmp;
    });

    return sorted;
  },

  getPipelineValue: (): number => {
    return get()
      .deals.filter(
        (d) => d.stage !== 'ClosedWon' && d.stage !== 'ClosedLost',
      )
      .reduce((sum, d) => sum + d.value, 0);
  },

  getWeightedPipelineValue: (): number => {
    return get()
      .deals.filter(
        (d) => d.stage !== 'ClosedWon' && d.stage !== 'ClosedLost',
      )
      .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useDealStore(): DealStore;
export function useDealStore<T>(selector: (state: DealStore) => T): T;
export function useDealStore<T>(selector?: (state: DealStore) => T) {
  return useStore(dealStore, selector as (state: DealStore) => T);
}
