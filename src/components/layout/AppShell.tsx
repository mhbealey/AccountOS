'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { ToastContainer } from '@/components/layout/ToastContainer';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';

export function AppShell({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  useBeforeUnload();

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
