'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Invoice,
  InvoiceLineItem,
  InvoiceStatusLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';
import { canTransition } from '@/lib/invoice-state-machine';

// ── Types ──────────────────────────────────────────────────────────────────

export interface InvoiceFilters {
  searchQuery: string;
  statusFilter: InvoiceStatusLiteral | 'all';
  clientFilter: string | 'all';
}

export interface InvoiceState {
  invoices: Invoice[];
  lineItems: InvoiceLineItem[];
  loading: boolean;
  filters: InvoiceFilters;
}

export interface InvoiceActions {
  setInvoices: (invoices: Invoice[]) => void;
  setLineItems: (lineItems: InvoiceLineItem[]) => void;
  setLoading: (loading: boolean) => void;
  addInvoice: (invoice: CreateInput<Invoice>, items?: CreateInput<InvoiceLineItem>[]) => Invoice;
  updateInvoice: (id: string, updates: UpdateInput<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addLineItem: (item: CreateInput<InvoiceLineItem>) => InvoiceLineItem;
  updateLineItem: (id: string, updates: UpdateInput<InvoiceLineItem>) => void;
  deleteLineItem: (id: string) => void;
  transitionStatus: (invoiceId: string, newStatus: InvoiceStatusLiteral) => boolean;
  getNextInvoiceNumber: (prefix?: string) => string;
  checkOverdueInvoices: () => string[];
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: InvoiceStatusLiteral | 'all') => void;
  setClientFilter: (clientId: string | 'all') => void;
  resetFilters: () => void;
  getFilteredInvoices: () => Invoice[];
  getInvoicesByClient: (clientId: string) => Invoice[];
  getLineItemsByInvoice: (invoiceId: string) => InvoiceLineItem[];
  getTotalOutstanding: () => number;
}

export type InvoiceStore = InvoiceState & InvoiceActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: InvoiceFilters = {
  searchQuery: '',
  statusFilter: 'all',
  clientFilter: 'all',
};

// ── Store ──────────────────────────────────────────────────────────────────

export const invoiceStore = createStore<InvoiceStore>()((set, get) => ({
  // State
  invoices: [],
  lineItems: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setInvoices: (invoices: Invoice[]) =>
    set(() => ({ invoices })),

  setLineItems: (lineItems: InvoiceLineItem[]) =>
    set(() => ({ lineItems })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addInvoice: (
    input: CreateInput<Invoice>,
    items?: CreateInput<InvoiceLineItem>[],
  ): Invoice => {
    const now = new Date();
    const invoice: Invoice = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Invoice;

    const newLineItems: InvoiceLineItem[] = (items ?? []).map((item, idx) => ({
      ...item,
      id: crypto.randomUUID(),
      invoiceId: invoice.id,
      sortOrder: item.sortOrder ?? idx,
    } as InvoiceLineItem));

    set((state) => ({
      invoices: [...state.invoices, invoice],
      lineItems: [...state.lineItems, ...newLineItems],
    }));

    return invoice;
  },

  updateInvoice: (id: string, updates: UpdateInput<Invoice>) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...updates, updatedAt: new Date() } : inv,
      ),
    })),

  deleteInvoice: (id: string) =>
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
      lineItems: state.lineItems.filter((li) => li.invoiceId !== id),
    })),

  addLineItem: (input: CreateInput<InvoiceLineItem>): InvoiceLineItem => {
    const item: InvoiceLineItem = {
      ...input,
      id: crypto.randomUUID(),
    } as InvoiceLineItem;
    set((state) => ({ lineItems: [...state.lineItems, item] }));
    return item;
  },

  updateLineItem: (id: string, updates: UpdateInput<InvoiceLineItem>) =>
    set((state) => ({
      lineItems: state.lineItems.map((li) =>
        li.id === id ? { ...li, ...updates } : li,
      ),
    })),

  deleteLineItem: (id: string) =>
    set((state) => ({
      lineItems: state.lineItems.filter((li) => li.id !== id),
    })),

  transitionStatus: (
    invoiceId: string,
    newStatus: InvoiceStatusLiteral,
  ): boolean => {
    const invoice = get().invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return false;

    if (!canTransition(invoice.status, newStatus)) return false;

    const now = new Date();
    const updates: Partial<Invoice> = {
      status: newStatus,
      updatedAt: now,
    };

    if (newStatus === 'Paid') {
      updates.paidDate = now;
    }

    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, ...updates } : inv,
      ),
    }));

    return true;
  },

  getNextInvoiceNumber: (prefix: string = 'INV'): string => {
    const { invoices } = get();
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);

    let maxNum = 0;
    for (const inv of invoices) {
      const match = inv.number.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    const next = maxNum + 1;
    return `${prefix}-${String(next).padStart(3, '0')}`;
  },

  checkOverdueInvoices: (): string[] => {
    const now = new Date();
    const overdueIds: string[] = [];

    set((state) => {
      const updated = state.invoices.map((inv) => {
        if (
          (inv.status === 'Sent' || inv.status === 'Viewed') &&
          new Date(inv.dueDate) < now
        ) {
          overdueIds.push(inv.id);
          return { ...inv, status: 'Overdue' as InvoiceStatusLiteral, updatedAt: now };
        }
        return inv;
      });
      return { invoices: updated };
    });

    return overdueIds;
  },

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setStatusFilter: (status: InvoiceStatusLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, statusFilter: status },
    })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, clientFilter: clientId },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredInvoices: (): Invoice[] => {
    const { invoices, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return invoices.filter((inv) => {
      if (
        query &&
        !inv.number.toLowerCase().includes(query) &&
        !(inv.notes ?? '').toLowerCase().includes(query)
      ) {
        return false;
      }
      if (
        filters.statusFilter !== 'all' &&
        inv.status !== filters.statusFilter
      ) {
        return false;
      }
      if (
        filters.clientFilter !== 'all' &&
        inv.clientId !== filters.clientFilter
      ) {
        return false;
      }
      return true;
    });
  },

  getInvoicesByClient: (clientId: string): Invoice[] => {
    return get().invoices.filter((inv) => inv.clientId === clientId);
  },

  getLineItemsByInvoice: (invoiceId: string): InvoiceLineItem[] => {
    return [...get().lineItems.filter((li) => li.invoiceId === invoiceId)].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  },

  getTotalOutstanding: (): number => {
    return get()
      .invoices.filter(
        (inv) =>
          inv.status === 'Sent' ||
          inv.status === 'Viewed' ||
          inv.status === 'Overdue',
      )
      .reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useInvoiceStore(): InvoiceStore;
export function useInvoiceStore<T>(selector: (state: InvoiceStore) => T): T;
export function useInvoiceStore<T>(selector?: (state: InvoiceStore) => T) {
  return useStore(invoiceStore, selector as (state: InvoiceStore) => T);
}
