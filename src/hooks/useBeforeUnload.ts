'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function useBeforeUnload() {
  const saveState = useUIStore((s) => s.saveState);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (saveState.status === 'saving') {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState]);
}
