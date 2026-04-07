import { create } from 'zustand';
import type { ToastMessage, UndoAction, SaveState } from '@/types';

// generateId inline to avoid circular deps
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UNDO_STACK_SIZE = 10;
const TOAST_DURATION_MS = 4000;

interface RecentlyViewedItem {
  type: string;
  id: string;
  name: string;
  href: string;
}

interface ConfirmDialog {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'default' | 'destructive';
  requireTypedConfirmation?: string;
  onConfirm: () => void | Promise<void>;
}

interface ActiveTimer {
  clientId: string;
  description: string;
  startedAt: Date;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // More menu
  moreMenuOpen: boolean;
  setMoreMenuOpen: (open: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Save state
  saveState: SaveState;
  setSaveState: (state: SaveState) => void;

  // Undo stack
  undoStack: UndoAction[];
  pushUndo: (action: Omit<UndoAction, 'id'>) => void;
  popUndo: () => UndoAction | undefined;
  clearUndoStack: () => void;

  // Recently viewed
  recentlyViewed: RecentlyViewedItem[];
  addRecentlyViewed: (item: RecentlyViewedItem) => void;

  // Active timer
  activeTimer: ActiveTimer | null;
  startTimer: (timer: ActiveTimer) => void;
  stopTimer: () => void;

  // Confirm dialog
  confirmDialog: ConfirmDialog | null;
  showConfirmDialog: (dialog: Omit<ConfirmDialog, 'open'>) => void;
  hideConfirmDialog: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // More menu
  moreMenuOpen: false,
  setMoreMenuOpen: (open) => set({ moreMenuOpen: open }),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, TOAST_DURATION_MS);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),

  // Save state
  saveState: { status: 'idle', lastSavedAt: null },
  setSaveState: (saveState) => set({ saveState }),

  // Undo stack
  undoStack: [],
  pushUndo: (action) => {
    const newAction: UndoAction = { ...action, id: generateId() };
    set((state) => ({
      undoStack: [newAction, ...state.undoStack].slice(0, UNDO_STACK_SIZE),
    }));
  },
  popUndo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return undefined;
    const [first, ...rest] = undoStack;
    if (!first) return undefined;
    set({ undoStack: rest });
    first.undo();
    return first;
  },
  clearUndoStack: () => set({ undoStack: [] }),

  // Recently viewed
  recentlyViewed: [],
  addRecentlyViewed: (item) =>
    set((state) => {
      const filtered = state.recentlyViewed.filter(
        (r) => !(r.type === item.type && r.id === item.id)
      );
      return { recentlyViewed: [item, ...filtered].slice(0, 5) };
    }),

  // Active timer
  activeTimer: null,
  startTimer: (timer) => set({ activeTimer: timer }),
  stopTimer: () => set({ activeTimer: null }),

  // Confirm dialog
  confirmDialog: null,
  showConfirmDialog: (dialog) =>
    set({ confirmDialog: { ...dialog, open: true } }),
  hideConfirmDialog: () => set({ confirmDialog: null }),
}));
