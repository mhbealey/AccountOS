'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

export interface HealthWeights {
  engagement: number;
  satisfaction: number;
  payment: number;
  adoption: number;
  csmPulse: number;
}

export interface FeatureFlags {
  aiCopilot: boolean;
  cashFlowForecast: boolean;
  pdfInvoices: boolean;
}

export interface Benchmarks {
  targetMrr: number;
  targetUtilization: number;
  targetWinRate: number;
  maxClientConcentration: number;
}

export interface SettingsState {
  // Business info
  businessName: string;
  address: string;
  phone: string;
  website: string;
  // Defaults
  defaultRate: number;
  defaultTerms: string;
  // Goals
  goalAnnualRev: number | null;
  goalMonthlyHrs: number | null;
  // Invoice
  invoiceCounter: number;
  invoicePrefix: string;
  // Health scoring
  healthWeights: HealthWeights;
  // Feature flags
  features: FeatureFlags;
  // Benchmarks
  benchmarks: Benchmarks;
}

export interface SettingsActions {
  updateSettings: (updates: Partial<SettingsState>) => void;
  updateHealthWeights: (weights: Partial<HealthWeights>) => boolean;
  updateFeatures: (features: Partial<FeatureFlags>) => void;
  updateBenchmarks: (benchmarks: Partial<Benchmarks>) => void;
  incrementInvoiceCounter: () => number;
  resetToDefaults: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultHealthWeights: HealthWeights = {
  engagement: 25,
  satisfaction: 20,
  payment: 20,
  adoption: 15,
  csmPulse: 20,
};

const defaultFeatures: FeatureFlags = {
  aiCopilot: false,
  cashFlowForecast: false,
  pdfInvoices: false,
};

const defaultBenchmarks: Benchmarks = {
  targetMrr: 10000,
  targetUtilization: 75,
  targetWinRate: 30,
  maxClientConcentration: 40,
};

const defaultState: SettingsState = {
  businessName: '',
  address: '',
  phone: '',
  website: '',
  defaultRate: 150,
  defaultTerms: 'Net 30',
  goalAnnualRev: null,
  goalMonthlyHrs: null,
  invoiceCounter: 0,
  invoicePrefix: 'INV',
  healthWeights: { ...defaultHealthWeights },
  features: { ...defaultFeatures },
  benchmarks: { ...defaultBenchmarks },
};

// ── Store ──────────────────────────────────────────────────────────────────

export const settingsStore = createStore<SettingsStore>()((set, get) => ({
  ...defaultState,

  updateSettings: (updates: Partial<SettingsState>) =>
    set((state) => ({
      ...state,
      ...updates,
      // Protect nested objects from being overwritten with partial data
      healthWeights: updates.healthWeights
        ? { ...state.healthWeights, ...updates.healthWeights }
        : state.healthWeights,
      features: updates.features
        ? { ...state.features, ...updates.features }
        : state.features,
      benchmarks: updates.benchmarks
        ? { ...state.benchmarks, ...updates.benchmarks }
        : state.benchmarks,
    })),

  updateHealthWeights: (weights: Partial<HealthWeights>): boolean => {
    const current = get().healthWeights;
    const merged = { ...current, ...weights };
    const sum =
      merged.engagement +
      merged.satisfaction +
      merged.payment +
      merged.adoption +
      merged.csmPulse;

    if (sum !== 100) return false;

    set(() => ({ healthWeights: merged }));
    return true;
  },

  updateFeatures: (features: Partial<FeatureFlags>) =>
    set((state) => ({
      features: { ...state.features, ...features },
    })),

  updateBenchmarks: (benchmarks: Partial<Benchmarks>) =>
    set((state) => ({
      benchmarks: { ...state.benchmarks, ...benchmarks },
    })),

  incrementInvoiceCounter: (): number => {
    const next = get().invoiceCounter + 1;
    set(() => ({ invoiceCounter: next }));
    return next;
  },

  resetToDefaults: () =>
    set(() => ({ ...defaultState })),
}));

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSettingsStore(): SettingsStore;
export function useSettingsStore<T>(selector: (state: SettingsStore) => T): T;
export function useSettingsStore<T>(selector?: (state: SettingsStore) => T) {
  return useStore(settingsStore, selector as (state: SettingsStore) => T);
}
