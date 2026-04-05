'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsed: number;
  clientId: string;
  description: string;
  category: string;
  billable: boolean;
  start: () => void;
  stop: () => { hours: number; elapsed: number };
  reset: () => void;
  tick: () => void;
  setClientId: (id: string) => void;
  setDescription: (desc: string) => void;
  setCategory: (cat: string) => void;
  setBillable: (b: boolean) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startTime: null,
      elapsed: 0,
      clientId: '',
      description: '',
      category: 'Delivery',
      billable: true,

      start: () => {
        set({ isRunning: true, startTime: Date.now(), elapsed: 0 });
      },

      stop: () => {
        const state = get();
        const now = Date.now();
        const totalMs = state.startTime ? now - state.startTime : 0;
        const totalSeconds = Math.floor(totalMs / 1000);
        const rawHours = totalSeconds / 3600;
        const rounded = Math.round(rawHours * 4) / 4; // nearest 15 min
        const hours = Math.max(rounded, 0.25);
        set({ isRunning: false, startTime: null, elapsed: totalSeconds });
        return { hours, elapsed: totalSeconds };
      },

      reset: () => {
        set({
          isRunning: false,
          startTime: null,
          elapsed: 0,
          clientId: '',
          description: '',
          category: 'Delivery',
          billable: true,
        });
      },

      tick: () => {
        const state = get();
        if (state.isRunning && state.startTime) {
          set({ elapsed: Math.floor((Date.now() - state.startTime) / 1000) });
        }
      },

      setClientId: (id) => set({ clientId: id }),
      setDescription: (desc) => set({ description: desc }),
      setCategory: (cat) => set({ category: cat }),
      setBillable: (b) => set({ billable: b }),
    }),
    {
      name: 'accountos-timer',
      partialize: (state) => ({
        isRunning: state.isRunning,
        startTime: state.startTime,
        elapsed: state.elapsed,
        clientId: state.clientId,
        description: state.description,
        category: state.category,
        billable: state.billable,
      }),
    }
  )
);

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
