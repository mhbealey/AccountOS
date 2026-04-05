'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplateForm } from '@/components/templates/TemplateForm';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Template } from '@/types';

// ---------------------------------------------------------------------------
// Category filter options
// ---------------------------------------------------------------------------

const CATEGORY_FILTERS = [
  { value: '',                 label: 'All Categories' },
  { value: 'welcome',         label: 'Welcome' },
  { value: 'follow_up',       label: 'Follow Up' },
  { value: 'check_in',        label: 'Check In' },
  { value: 'qbr_invite',      label: 'QBR Invite' },
  { value: 'renewal',         label: 'Renewal' },
  { value: 'thank_you',       label: 'Thank You' },
  { value: 'referral_ask',    label: 'Referral Ask' },
  { value: 'proposal_cover',  label: 'Proposal Cover' },
  { value: 'payment_reminder',label: 'Payment Reminder' },
  { value: 'offboarding',     label: 'Offboarding' },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Preview state
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ---------------------------------------------------------------------------
  // Filtered list
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    if (!categoryFilter) return templates;
    return templates.filter((t) => t.category === categoryFilter);
  }, [templates, categoryFilter]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSave = async (data: {
    name: string;
    category: string;
    subject: string;
    body: string;
    variables: string;
  }) => {
    setSaving(true);
    try {
      if (editingTemplate) {
        const res = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const updated = await res.json();
          setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setFormOpen(false);
          setEditingTemplate(null);
        }
      } else {
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const created = await res.json();
          setTemplates((prev) => [created, ...prev]);
          setFormOpen(false);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/templates/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setFormOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reusable email templates with dynamic variables for client communication.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Filter bar */}
      {!loading && templates.length > 0 && (
        <div className="flex items-center gap-3">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-48"
          >
            {CATEGORY_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && templates.length === 0 && (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No email templates yet"
          description="Create your first email template to speed up client communication."
          actionLabel="New Template"
          onAction={openCreate}
        />
      )}

      {/* Empty filtered state */}
      {!loading && templates.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No templates in this category"
          description="Try selecting a different category or create a new template."
        />
      )}

      {/* Card grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onPreview={setPreviewTemplate}
            />
          ))}
        </div>
      )}

      {/* Create / Edit form dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(val) => {
          setFormOpen(val);
          if (!val) setEditingTemplate(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <TemplateForm
            template={editingTemplate}
            onSave={handleSave}
            onCancel={() => {
              setFormOpen(false);
              setEditingTemplate(null);
            }}
            saving={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(val) => {
          if (!val) setPreviewTemplate(null);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} - Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <TemplatePreview
              subject={previewTemplate.subject ?? ''}
              body={previewTemplate.body}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(val) => {
          if (!val) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Delete Template</h2>
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
