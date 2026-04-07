'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

export function SaveIndicator() {
  const saveState = useUIStore((state) => state.saveState);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (saveState.status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
    setShowSaved(false);
  }, [saveState.status]);

  if (saveState.status === 'idle') return null;

  if (saveState.status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 animate-pulse">
        <Loader2 size={12} className="animate-spin" />
        Saving...
      </span>
    );
  }

  if (saveState.status === 'saved' && showSaved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
        <Check size={12} />
        Saved
      </span>
    );
  }

  if (saveState.status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle size={12} />
        Save failed
      </span>
    );
  }

  return null;
}
