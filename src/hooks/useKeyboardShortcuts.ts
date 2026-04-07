'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const popUndo = useUIStore((s) => s.popUndo);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const action = popUndo();
        if (action) {
          addToast({ type: 'info', title: `Undone: ${action.description}` });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, popUndo, addToast]);
}
