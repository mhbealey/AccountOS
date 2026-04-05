'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Task,
  TaskPriorityLiteral,
  TaskStatusLiteral,
  RecurringIntervalLiteral,
  CreateInput,
  UpdateInput,
} from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export type TaskFilterPreset =
  | 'all'
  | 'today'
  | 'thisWeek'
  | 'overdue'
  | 'completed';

export interface TaskFilters {
  preset: TaskFilterPreset;
  clientFilter: string | 'all';
  categoryFilter: string | 'all';
  statusFilter: TaskStatusLiteral | 'all';
  priorityFilter: TaskPriorityLiteral | 'all';
  searchQuery: string;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  filters: TaskFilters;
}

export interface TaskActions {
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  addTask: (task: CreateInput<Task>) => Task;
  updateTask: (id: string, updates: UpdateInput<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  completeRecurringTask: (id: string) => Task | null;
  setPreset: (preset: TaskFilterPreset) => void;
  setClientFilter: (clientId: string | 'all') => void;
  setCategoryFilter: (category: string | 'all') => void;
  setStatusFilter: (status: TaskStatusLiteral | 'all') => void;
  setPriorityFilter: (priority: TaskPriorityLiteral | 'all') => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  getFilteredTasks: () => Task[];
}

export type TaskStore = TaskState & TaskActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: TaskFilters = {
  preset: 'all',
  clientFilter: 'all',
  categoryFilter: 'all',
  statusFilter: 'all',
  priorityFilter: 'all',
  searchQuery: '',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function calculateNextDueDate(
  currentDue: Date,
  interval: RecurringIntervalLiteral,
): Date {
  const next = new Date(currentDue);
  switch (interval) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
  }
  return next;
}

function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

function endOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const daysUntilSunday = 7 - day;
  result.setDate(result.getDate() + daysUntilSunday);
  result.setHours(23, 59, 59, 999);
  return result;
}

function matchesPreset(task: Task, preset: TaskFilterPreset): boolean {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = endOfWeek(now);

  switch (preset) {
    case 'today':
      if (!task.dueDate) return false;
      return (
        new Date(task.dueDate) >= todayStart &&
        new Date(task.dueDate) <= todayEnd &&
        task.status !== 'done'
      );
    case 'thisWeek':
      if (!task.dueDate) return false;
      return (
        new Date(task.dueDate) >= todayStart &&
        new Date(task.dueDate) <= weekEnd &&
        task.status !== 'done'
      );
    case 'overdue':
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < todayStart && task.status !== 'done';
    case 'completed':
      return task.status === 'done';
    default:
      return true;
  }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const taskStore = createStore<TaskStore>()((set, get) => ({
  // State
  tasks: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setTasks: (tasks: Task[]) =>
    set(() => ({ tasks })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addTask: (input: CreateInput<Task>): Task => {
    const now = new Date();
    const task: Task = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Task;
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  updateTask: (id: string, updates: UpdateInput<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
      ),
    })),

  deleteTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleTask: (id: string) =>
    set((state) => {
      const now = new Date();
      return {
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          const newStatus: TaskStatusLiteral =
            t.status === 'done' ? 'open' : 'done';
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'done' ? now : null,
            updatedAt: now,
          };
        }),
      };
    }),

  completeRecurringTask: (id: string): Task | null => {
    const state = get();
    const task = state.tasks.find((t) => t.id === id);
    if (!task || !task.recurring || !task.dueDate) return null;

    const now = new Date();
    const nextDue = calculateNextDueDate(
      new Date(task.dueDate),
      task.recurring,
    );

    const nextTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: 'open',
      completedAt: null,
      dueDate: nextDue,
      nextRecurrence: null,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      tasks: [
        ...state.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: 'done' as TaskStatusLiteral,
                completedAt: now,
                nextRecurrence: nextDue,
                updatedAt: now,
              }
            : t,
        ),
        nextTask,
      ],
    }));

    return nextTask;
  },

  setPreset: (preset: TaskFilterPreset) =>
    set((state) => ({ filters: { ...state.filters, preset } })),

  setClientFilter: (clientId: string | 'all') =>
    set((state) => ({ filters: { ...state.filters, clientFilter: clientId } })),

  setCategoryFilter: (category: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, categoryFilter: category },
    })),

  setStatusFilter: (status: TaskStatusLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, statusFilter: status },
    })),

  setPriorityFilter: (priority: TaskPriorityLiteral | 'all') =>
    set((state) => ({
      filters: { ...state.filters, priorityFilter: priority },
    })),

  setSearchQuery: (query: string) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredTasks: (): Task[] => {
    const { tasks, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return tasks.filter((t) => {
      if (!matchesPreset(t, filters.preset)) return false;
      if (query && !t.title.toLowerCase().includes(query)) return false;
      if (
        filters.clientFilter !== 'all' &&
        t.clientId !== filters.clientFilter
      ) {
        return false;
      }
      if (
        filters.categoryFilter !== 'all' &&
        t.category !== filters.categoryFilter
      ) {
        return false;
      }
      if (
        filters.statusFilter !== 'all' &&
        t.status !== filters.statusFilter
      ) {
        return false;
      }
      if (
        filters.priorityFilter !== 'all' &&
        t.priority !== filters.priorityFilter
      ) {
        return false;
      }
      return true;
    });
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTaskStore(): TaskStore;
export function useTaskStore<T>(selector: (state: TaskStore) => T): T;
export function useTaskStore<T>(selector?: (state: TaskStore) => T) {
  return useStore(taskStore, selector as (state: TaskStore) => T);
}
