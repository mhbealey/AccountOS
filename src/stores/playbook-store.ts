'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Playbook,
  PlaybookStep,
  Task,
  PlaybookTriggerLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PlaybookFilters {
  searchQuery: string;
  triggerFilter: PlaybookTriggerLiteral | 'all';
  activeOnly: boolean;
}

export interface PlaybookState {
  playbooks: Playbook[];
  loading: boolean;
  filters: PlaybookFilters;
}

export interface PlaybookActions {
  setPlaybooks: (playbooks: Playbook[]) => void;
  setLoading: (loading: boolean) => void;
  addPlaybook: (
    playbook: CreateInput<Playbook>,
    steps?: CreateInput<PlaybookStep>[],
  ) => Playbook;
  updatePlaybook: (id: string, updates: UpdateInput<Playbook>) => void;
  deletePlaybook: (id: string) => void;
  addStep: (step: CreateInput<PlaybookStep>) => PlaybookStep;
  updateStep: (id: string, updates: UpdateInput<PlaybookStep>) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (playbookId: string, stepIds: string[]) => void;
  triggerPlaybook: (playbookId: string, clientId: string) => Task[];
  setSearchQuery: (query: string) => void;
  setTriggerFilter: (trigger: PlaybookTriggerLiteral | 'all') => void;
  setActiveOnly: (activeOnly: boolean) => void;
  resetFilters: () => void;
  getFilteredPlaybooks: () => Playbook[];
  getPlaybooksByTrigger: (trigger: PlaybookTriggerLiteral) => Playbook[];
}

export type PlaybookStore = PlaybookState & PlaybookActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: PlaybookFilters = {
  searchQuery: '',
  triggerFilter: 'all',
  activeOnly: false,
};

// ── Store ──────────────────────────────────────────────────────────────────

export const playbookStore = createStore<PlaybookStore>()((set, get) => ({
  // State
  playbooks: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setPlaybooks: (playbooks: Playbook[]) =>
    set(() => ({ playbooks })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addPlaybook: (
    input: CreateInput<Playbook>,
    steps?: CreateInput<PlaybookStep>[],
  ): Playbook => {
    const now = new Date();
    const playbookId = crypto.randomUUID();

    const newSteps: PlaybookStep[] = (steps ?? []).map((s, idx) => ({
      ...s,
      id: crypto.randomUUID(),
      playbookId,
      sortOrder: s.sortOrder ?? idx,
    } as PlaybookStep));

    const playbook: Playbook = {
      ...input,
      id: playbookId,
      steps: newSteps,
      createdAt: now,
    } as Playbook;

    set((state) => ({ playbooks: [...state.playbooks, playbook] }));
    return playbook;
  },

  updatePlaybook: (id: string, updates: UpdateInput<Playbook>) =>
    set((state) => ({
      playbooks: state.playbooks.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  deletePlaybook: (id: string) =>
    set((state) => ({
      playbooks: state.playbooks.filter((p) => p.id !== id),
    })),

  addStep: (input: CreateInput<PlaybookStep>): PlaybookStep => {
    const step: PlaybookStep = {
      ...input,
      id: crypto.randomUUID(),
    } as PlaybookStep;

    set((state) => ({
      playbooks: state.playbooks.map((p) => {
        if (p.id !== step.playbookId) return p;
        return {
          ...p,
          steps: [...(p.steps ?? []), step],
        };
      }),
    }));

    return step;
  },

  updateStep: (id: string, updates: UpdateInput<PlaybookStep>) =>
    set((state) => ({
      playbooks: state.playbooks.map((p) => {
        const stepsArr = p.steps ?? [];
        const hasStep = stepsArr.some((s) => s.id === id);
        if (!hasStep) return p;
        return {
          ...p,
          steps: stepsArr.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        };
      }),
    })),

  deleteStep: (id: string) =>
    set((state) => ({
      playbooks: state.playbooks.map((p) => {
        const stepsArr = p.steps ?? [];
        const hasStep = stepsArr.some((s) => s.id === id);
        if (!hasStep) return p;
        return {
          ...p,
          steps: stepsArr.filter((s) => s.id !== id),
        };
      }),
    })),

  reorderSteps: (playbookId: string, stepIds: string[]) =>
    set((state) => ({
      playbooks: state.playbooks.map((p) => {
        if (p.id !== playbookId) return p;
        const stepsArr = p.steps ?? [];
        const reordered = stepIds
          .map((id, idx) => {
            const step = stepsArr.find((s) => s.id === id);
            if (!step) return null;
            return { ...step, sortOrder: idx };
          })
          .filter((s): s is PlaybookStep => s !== null);
        return { ...p, steps: reordered };
      }),
    })),

  triggerPlaybook: (playbookId: string, clientId: string): Task[] => {
    const playbook = get().playbooks.find((p) => p.id === playbookId);
    if (!playbook || !playbook.isActive) return [];

    const steps = [...(playbook.steps ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    const now = new Date();
    const tasks: Task[] = steps.map((step) => {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + step.dayOffset);

      return {
        id: crypto.randomUUID(),
        title: step.title,
        description: step.taskTemplate ?? null,
        clientId,
        priority: 'Medium' as const,
        status: 'open' as const,
        category: null,
        dueDate,
        completedAt: null,
        recurring: null,
        nextRecurrence: null,
        playbook: playbook.name,
        createdAt: now,
        updatedAt: now,
      };
    });

    return tasks;
  },

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setTriggerFilter: (trigger: PlaybookTriggerLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, triggerFilter: trigger },
    })),

  setActiveOnly: (activeOnly: boolean) =>
    set((state) => ({
      filters: { ...state.filters, activeOnly },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredPlaybooks: (): Playbook[] => {
    const { playbooks, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return playbooks.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query)) return false;
      if (
        filters.triggerFilter !== 'all' &&
        p.trigger !== filters.triggerFilter
      ) {
        return false;
      }
      if (filters.activeOnly && !p.isActive) return false;
      return true;
    });
  },

  getPlaybooksByTrigger: (trigger: PlaybookTriggerLiteral): Playbook[] => {
    return get().playbooks.filter(
      (p) => p.trigger === trigger && p.isActive,
    );
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function usePlaybookStore(): PlaybookStore;
export function usePlaybookStore<T>(selector: (state: PlaybookStore) => T): T;
export function usePlaybookStore<T>(selector?: (state: PlaybookStore) => T) {
  return useStore(playbookStore, selector as (state: PlaybookStore) => T);
}
