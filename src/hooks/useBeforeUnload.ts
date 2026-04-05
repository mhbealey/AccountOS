'use client';

import { useEffect, useRef } from 'react';
import { uiStore } from '@/stores/ui-store';

/**
 * Listens for the `beforeunload` event and flushes any pending saves.
 * Optionally accepts a custom flush callback for additional cleanup.
 */
export function useBeforeUnload(onFlush?: () => void) {
  const flushRef = useRef(onFlush);
  flushRef.current = onFlush;

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      const saveStatus = uiStore.getState().saveStatus;

      // Run custom flush callback if provided
      if (flushRef.current) {
        flushRef.current();
      }

      // Warn user if there are unsaved changes
      if (saveStatus === 'saving') {
        event.preventDefault();
        // Modern browsers ignore custom returnValue but still require it to be set
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, []);
}
