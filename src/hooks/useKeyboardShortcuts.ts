'use client';

import { useEffect } from 'react';
import { uiStore } from '@/stores/ui-store';

export interface KeyboardShortcut {
  /** The key to listen for (e.g. 'k', 'Escape', 's') */
  key: string;
  /** Require Cmd (Mac) or Ctrl (Windows/Linux) */
  meta?: boolean;
  /** Require Shift */
  shift?: boolean;
  /** Require Alt/Option */
  alt?: boolean;
  /** Handler to invoke */
  handler: (event: KeyboardEvent) => void;
  /** Optional description for command palette display */
  description?: string;
}

const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    meta: true,
    description: 'Toggle command palette',
    handler: () => {
      const state = uiStore.getState();
      state.setCommandPaletteOpen(!state.commandPaletteOpen);
    },
  },
  {
    key: 'Escape',
    description: 'Close modal or command palette',
    handler: () => {
      const state = uiStore.getState();
      if (state.commandPaletteOpen) {
        state.setCommandPaletteOpen(false);
      } else if (state.activeModal) {
        state.closeModal();
      }
    },
  },
];

/**
 * Registers global keyboard shortcuts.
 * Merges any additional custom shortcuts with the built-in defaults.
 */
export function useKeyboardShortcuts(
  customShortcuts: KeyboardShortcut[] = [],
) {
  useEffect(() => {
    const allShortcuts = [...defaultShortcuts, ...customShortcuts];

    const handler = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in form elements
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable;

      for (const shortcut of allShortcuts) {
        // Escape always fires, even in editable fields
        if (isEditable && shortcut.key !== 'Escape') continue;

        const metaMatch = shortcut.meta
          ? event.metaKey || event.ctrlKey
          : !event.metaKey && !event.ctrlKey;
        const shiftMatch = shortcut.shift
          ? event.shiftKey
          : !event.shiftKey;
        const altMatch = shortcut.alt
          ? event.altKey
          : !event.altKey;

        if (
          event.key === shortcut.key &&
          metaMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.handler(event);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [customShortcuts]);
}
