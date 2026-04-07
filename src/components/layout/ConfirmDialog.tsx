'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function ConfirmDialog() {
  const confirmDialog = useUIStore((state) => state.confirmDialog) ?? null;
  const hideConfirmDialog = useUIStore((state) => state.hideConfirmDialog);
  const [typedText, setTypedText] = useState('');

  // Reset typed text when dialog changes
  useEffect(() => {
    setTypedText('');
  }, [confirmDialog]);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmDialog) {
        hideConfirmDialog();
      }
    },
    [confirmDialog, hideConfirmDialog]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!confirmDialog) return null;

  const {
    title,
    description,
    requireTypedConfirmation,
    onConfirm,
    variant = 'default' as const,
  } = confirmDialog;

  const isConfirmDisabled =
    requireTypedConfirmation != null && typedText !== requireTypedConfirmation;

  const variantStyles: Record<string, string> = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    default: 'bg-[#00D4AA] hover:bg-[#00E8BC] text-[#050E1A]',
  };
  const confirmButtonClass = variantStyles[variant] ?? variantStyles.default;

  const handleConfirm = () => {
    onConfirm();
    hideConfirmDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => hideConfirmDialog()}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-6 mx-4">
        <h2 className="text-lg font-semibold text-[#F0F4F8] mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-[#829AB1] mb-4">{description}</p>
        )}

        {requireTypedConfirmation != null && (
          <div className="mb-4">
            <p className="text-xs text-[#829AB1] mb-2">
              Type{' '}
              <span className="font-mono text-[#F0F4F8] bg-[#050E1A] px-1.5 py-0.5 rounded">
                {requireTypedConfirmation}
              </span>{' '}
              to confirm
            </p>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#1A3550] bg-[#050E1A] text-[#F0F4F8] placeholder-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]"
              placeholder="Type here..."
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => hideConfirmDialog()}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${confirmButtonClass}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
