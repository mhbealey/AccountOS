'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface RecentlyViewedItem {
  id: string;
  name: string;
  type: string;
  path: string;
}

export interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  modalData: unknown;
  toasts: Toast[];
  saveStatus: SaveStatus;
  recentlyViewed: RecentlyViewedItem[];
  commandPaletteOpen: boolean;
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export type UIStore = UIState & UIActions;

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_RECENTLY_VIEWED = 20;

// ── Store ──────────────────────────────────────────────────────────────────

export const uiStore = createStore<UIStore>()((set) => ({
  // State
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  toasts: [],
  saveStatus: 'idle',
  recentlyViewed: [],
  commandPaletteOpen: false,

  // Actions
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed: boolean) =>
    set(() => ({ sidebarCollapsed: collapsed })),

  openModal: (modal: string, data?: unknown) =>
    set(() => ({ activeModal: modal, modalData: data ?? null })),

  closeModal: () =>
    set(() => ({ activeModal: null, modalData: null })),

  addToast: (toast: Omit<Toast, 'id'>) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: crypto.randomUUID() },
      ],
    })),

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setSaveStatus: (status: SaveStatus) =>
    set(() => ({ saveStatus: status })),

  addRecentlyViewed: (item: RecentlyViewedItem) =>
    set((state) => {
      const filtered = state.recentlyViewed.filter((r) => r.id !== item.id);
      return {
        recentlyViewed: [item, ...filtered].slice(0, MAX_RECENTLY_VIEWED),
      };
    }),

  setCommandPaletteOpen: (open: boolean) =>
    set(() => ({ commandPaletteOpen: open })),
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useUIStore(): UIStore;
export function useUIStore<T>(selector: (state: UIStore) => T): T;
export function useUIStore<T>(selector?: (state: UIStore) => T) {
  return useStore(uiStore, selector as (state: UIStore) => T);
}
