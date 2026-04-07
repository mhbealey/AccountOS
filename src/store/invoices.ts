'use client';

import { create } from 'zustand';

interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: string;
  dueDate: string;
  [key: string]: unknown;
}

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  updateInvoiceStatus: (id: string, status: string) => Promise<void>;
}

export const useInvoicesStore = create<InvoiceState>()((set) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/v1/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      set({ invoices: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  updateInvoiceStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update invoice status');
      const updated = await res.json();
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
