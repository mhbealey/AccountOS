'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaybookCard } from '@/components/playbooks/PlaybookCard';
import { PlaybookForm } from '@/components/playbooks/PlaybookForm';
import { TriggerDialog } from '@/components/playbooks/TriggerDialog';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import type { Playbook } from '@/types';
import type { StepDraft } from '@/components/playbooks/StepsEditor';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null);

  // Trigger state
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [triggerPlaybook, setTriggerPlaybook] = useState<Playbook | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Playbook | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchPlaybooks = useCallback(async () => {
    try {
      const res = await fetch('/api/playbooks');
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSave = async (data: {
    name: string;
    description: string;
    trigger: string;
    isActive: boolean;
    steps: StepDraft[];
  }) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        steps: data.steps.map((s) => ({
          title: s.title,
          dayOffset: s.dayOffset,
          taskTemplate: s.taskTemplate || null,
          sortOrder: s.sortOrder,
        })),
      };

      if (editingPlaybook) {
        const res = await fetch(`/api/playbooks/${editingPlaybook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setPlaybooks((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setFormOpen(false);
          setEditingPlaybook(null);
        }
      } else {
        const res = await fetch('/api/playbooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setPlaybooks((prev) => [created, ...prev]);
          setFormOpen(false);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (playbook: Playbook) => {
    const res = await fetch(`/api/playbooks/${playbook.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !playbook.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlaybooks((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/playbooks/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      setPlaybooks((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleTriggerConfirm = async (
    playbookId: string,
    clientId: string
  ): Promise<{ tasksCreated: number; client: string } | null> => {
    const res = await fetch(`/api/playbooks/${playbookId}/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    if (res.ok) {
      const data = await res.json();
      return { tasksCreated: data.tasksCreated, client: data.client };
    }
    return null;
  };

  const openEdit = (playbook: Playbook) => {
    setEditingPlaybook(playbook);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingPlaybook(null);
    setFormOpen(true);
  };

  const openTrigger = (playbook: Playbook) => {
    setTriggerPlaybook(playbook);
    setTriggerOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Playbooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automate repeatable workflows with structured step sequences.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Playbook
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-28" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && playbooks.length === 0 && (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No playbooks yet"
          description="Create your first playbook to automate common client workflows."
          actionLabel="New Playbook"
          onAction={openCreate}
        />
      )}

      {/* Card grid */}
      {!loading && playbooks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((pb) => (
            <PlaybookCard
              key={pb.id}
              playbook={pb}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onTrigger={openTrigger}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Create / Edit form dialog */}
      <Dialog open={formOpen} onOpenChange={(val) => { setFormOpen(val); if (!val) setEditingPlaybook(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <PlaybookForm
            playbook={editingPlaybook}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditingPlaybook(null); }}
            saving={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Trigger dialog */}
      <TriggerDialog
        playbook={triggerPlaybook}
        open={triggerOpen}
        onOpenChange={(val) => { setTriggerOpen(val); if (!val) setTriggerPlaybook(null); }}
        onConfirm={handleTriggerConfirm}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(val) => { if (!val) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Delete Playbook</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
