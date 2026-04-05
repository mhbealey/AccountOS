'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { GoalForm } from './GoalForm';
import { formatDate } from '@/lib/utils';
import type { ClientGoal } from '@/types';
import { Plus, Target, Pencil, Trash2 } from 'lucide-react';

interface GoalListProps {
  goals: ClientGoal[];
  clientId: string;
  onRefresh: () => void;
}

function getGoalStatusVariant(status: string) {
  switch (status) {
    case 'In Progress': return 'info';
    case 'Achieved': return 'success';
    case 'Missed': return 'danger';
    case 'Cancelled': return 'default';
    default: return 'default';
  }
}

export function GoalList({ goals, clientId, onRefresh }: GoalListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ClientGoal | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async (data: Partial<ClientGoal>) => {
    const res = await fetch(`/api/clients/${clientId}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    onRefresh();
  };

  const handleUpdate = async (data: Partial<ClientGoal>) => {
    if (!editingGoal) return;
    const res = await fetch(`/api/goals/${editingGoal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  if (goals.length === 0 && !formOpen) {
    return (
      <>
        <EmptyState
          icon={<Target className="h-7 w-7" />}
          title="No goals set for this client"
          description="Set goals to track progress and outcomes."
          actionLabel="Add Goal"
          onAction={() => setFormOpen(true)}
        />
        <GoalForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleCreate}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          {goals.length} Goal{goals.length !== 1 ? 's' : ''}
        </h3>
        <Button size="sm" onClick={() => { setEditingGoal(null); setFormOpen(true); }}>
          <Plus className="h-3.5 w-3.5" />
          Add Goal
        </Button>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = goal.targetValue && goal.targetValue > 0
            ? Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100)
            : 0;
          return (
            <div
              key={goal.id}
              className="rounded-lg border border-border bg-[#12122a] p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{goal.title}</span>
                    <Badge variant={getGoalStatusVariant(goal.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                      {goal.status}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => { setEditingGoal(goal); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleting === goal.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {goal.targetValue != null && goal.targetValue > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      {goal.targetMetric ? `${goal.targetMetric}: ` : ''}
                      {goal.currentValue ?? 0} / {goal.targetValue}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {goal.quarter && <span>Quarter: {goal.quarter}</span>}
                {goal.dueDate && <span>Due: {formatDate(goal.dueDate)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <GoalForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingGoal(null);
        }}
        goal={editingGoal}
        onSubmit={editingGoal ? handleUpdate : handleCreate}
      />
    </div>
  );
}
