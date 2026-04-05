'use client';

import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface UndoRedoOperation {
  type: string;
  undo: () => void;
  redo: () => void;
  description: string;
}

interface UndoRedoSnapshot {
  past: UndoRedoOperation[];
  future: UndoRedoOperation[];
  canUndo: boolean;
  canRedo: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_HISTORY = 10;

// ── In-memory store (not Zustand - lightweight standalone) ─────────────────

let past: UndoRedoOperation[] = [];
let future: UndoRedoOperation[] = [];
let listeners: Set<() => void> = new Set();

function getSnapshot(): UndoRedoSnapshot {
  return {
    past: [...past],
    future: [...future],
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}

let cachedSnapshot: UndoRedoSnapshot = getSnapshot();

function notify() {
  cachedSnapshot = getSnapshot();
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function pushOperation(op: UndoRedoOperation) {
  past = [...past, op].slice(-MAX_HISTORY);
  future = [];
  notify();
}

function undoLast() {
  if (past.length === 0) return;
  const op = past[past.length - 1];
  past = past.slice(0, -1);
  future = [...future, op];
  op.undo();
  notify();
}

function redoLast() {
  if (future.length === 0) return;
  const op = future[future.length - 1];
  future = future.slice(0, -1);
  past = [...past, op].slice(-MAX_HISTORY);
  op.redo();
  notify();
}

function clearHistory() {
  past = [];
  future = [];
  notify();
}

// ── Hook ───────────────────────────────────────────────────────────────────

export interface UseUndoRedoReturn {
  /** Push a new undoable operation onto the stack */
  push: (op: UndoRedoOperation) => void;
  /** Undo the last operation */
  undo: () => void;
  /** Redo the last undone operation */
  redo: () => void;
  /** Whether there is an operation to undo */
  canUndo: boolean;
  /** Whether there is an operation to redo */
  canRedo: boolean;
  /** The current undo history (most recent last) */
  past: UndoRedoOperation[];
  /** The current redo stack (most recent last) */
  future: UndoRedoOperation[];
  /** Clear all undo/redo history */
  clear: () => void;
}

/**
 * Provides undo/redo functionality backed by an in-memory operation stack.
 * Stores up to 10 operations. Each operation must provide its own undo and redo functions.
 *
 * @example
 * ```tsx
 * const { push, undo, redo, canUndo, canRedo } = useUndoRedo();
 *
 * function handleDelete(client: Client) {
 *   deleteClient(client.id);
 *   push({
 *     type: 'delete-client',
 *     description: `Delete ${client.name}`,
 *     undo: () => addClient(client),
 *     redo: () => deleteClient(client.id),
 *   });
 * }
 * ```
 */
export function useUndoRedo(): UseUndoRedoReturn {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => cachedSnapshot,
    () => cachedSnapshot,
  );

  const push = useCallback((op: UndoRedoOperation) => {
    pushOperation(op);
  }, []);

  const undo = useCallback(() => {
    undoLast();
  }, []);

  const redo = useCallback(() => {
    redoLast();
  }, []);

  const clear = useCallback(() => {
    clearHistory();
  }, []);

  return useMemo(
    () => ({
      push,
      undo,
      redo,
      canUndo: snapshot.canUndo,
      canRedo: snapshot.canRedo,
      past: snapshot.past,
      future: snapshot.future,
      clear,
    }),
    [push, undo, redo, clear, snapshot],
  );
}
