'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Template, CreateInput, UpdateInput } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TemplateFilters {
  searchQuery: string;
  categoryFilter: string | 'all';
}

export interface TemplateState {
  templates: Template[];
  loading: boolean;
  filters: TemplateFilters;
}

export interface TemplateActions {
  setTemplates: (templates: Template[]) => void;
  setLoading: (loading: boolean) => void;
  addTemplate: (template: CreateInput<Template>) => Template;
  updateTemplate: (id: string, updates: UpdateInput<Template>) => void;
  deleteTemplate: (id: string) => void;
  renderTemplate: (templateId: string, variables: Record<string, string>) => string | null;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | 'all') => void;
  resetFilters: () => void;
  getFilteredTemplates: () => Template[];
  getTemplatesByCategory: (category: string) => Template[];
  getCategories: () => string[];
}

export type TemplateStore = TemplateState & TemplateActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultFilters: TemplateFilters = {
  searchQuery: '',
  categoryFilter: 'all',
};

// ── Store ──────────────────────────────────────────────────────────────────

export const templateStore = createStore<TemplateStore>()((set, get) => ({
  // State
  templates: [],
  loading: false,
  filters: { ...defaultFilters },

  // Actions
  setTemplates: (templates: Template[]) =>
    set(() => ({ templates })),

  setLoading: (loading: boolean) =>
    set(() => ({ loading })),

  addTemplate: (input: CreateInput<Template>): Template => {
    const template: Template = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    } as Template;
    set((state) => ({ templates: [...state.templates, template] }));
    return template;
  },

  updateTemplate: (id: string, updates: UpdateInput<Template>) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    })),

  deleteTemplate: (id: string) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),

  renderTemplate: (
    templateId: string,
    variables: Record<string, string>,
  ): string | null => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return null;

    let rendered = template.body;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(
        new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'),
        value,
      );
    }
    return rendered;
  },

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setCategoryFilter: (category: string | 'all') =>
    set((state) => ({
      filters: { ...state.filters, categoryFilter: category },
    })),

  resetFilters: () =>
    set(() => ({ filters: { ...defaultFilters } })),

  getFilteredTemplates: (): Template[] => {
    const { templates, filters } = get();
    const query = filters.searchQuery.toLowerCase();

    return templates.filter((t) => {
      if (
        query &&
        !t.name.toLowerCase().includes(query) &&
        !(t.subject ?? '').toLowerCase().includes(query)
      ) {
        return false;
      }
      if (
        filters.categoryFilter !== 'all' &&
        t.category !== filters.categoryFilter
      ) {
        return false;
      }
      return true;
    });
  },

  getTemplatesByCategory: (category: string): Template[] => {
    return get().templates.filter((t) => t.category === category);
  },

  getCategories: (): string[] => {
    const categories = new Set(get().templates.map((t) => t.category));
    return [...categories].sort();
  },
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTemplateStore(): TemplateStore;
export function useTemplateStore<T>(selector: (state: TemplateStore) => T): T;
export function useTemplateStore<T>(selector?: (state: TemplateStore) => T) {
  return useStore(templateStore, selector as (state: TemplateStore) => T);
}
