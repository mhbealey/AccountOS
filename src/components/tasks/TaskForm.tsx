'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  Task,
  Client,
  TaskPriorityLiteral,
  TaskStatusLiteral,
  RecurringIntervalLiteral,
} from '@/types';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  clients: Pick<Client, 'id' | 'name'>[];
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  clientId: string;
  priority: TaskPriorityLiteral;
  category: string;
  dueDate: string;
  status: TaskStatusLiteral;
  recurring: RecurringIntervalLiteral | '';
}

const CATEGORIES = [
  'Follow-up',
  'Deliverable',
  'Admin',
  'Renewal',
  'QBR',
  'Onboarding',
];

export function TaskForm({
  open,
  onOpenChange,
  task,
  clients,
  onSubmit,
  isLoading,
}: TaskFormProps) {
  const isEditing = !!task;

  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    clientId: '',
    priority: 'Medium',
    category: '',
    dueDate: '',
    status: 'open',
    recurring: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        clientId: task.clientId || '',
        priority: task.priority,
        category: task.category || '',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        status: task.status,
        recurring: task.recurring || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        clientId: '',
        priority: 'Medium',
        category: '',
        dueDate: '',
        status: 'open',
        recurring: '',
      });
    }
    setErrors({});
  }, [task, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.recurring && !form.dueDate) {
      errs.dueDate = 'Due date is required for recurring tasks';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g., Follow up with client on proposal"
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-client">Client</Label>
            <Select
              id="task-client"
              value={form.clientId}
              onChange={(e) =>
                setForm((p) => ({ ...p, clientId: e.target.value }))
              }
            >
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                id="task-priority"
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    priority: e.target.value as TaskPriorityLiteral,
                  }))
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-category">Category</Label>
              <Select
                id="task-category"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
              {errors.dueDate && (
                <p className="text-xs text-red-400">{errors.dueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as TaskStatusLiteral,
                  }))
                }
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-recurring">Recurring</Label>
            <Select
              id="task-recurring"
              value={form.recurring}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  recurring: e.target.value as RecurringIntervalLiteral | '',
                }))
              }
            >
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update Task'
                  : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
