'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RepeatIcon } from 'lucide-react';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Task, TaskPriorityLiteral } from '@/types';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onClick: (task: Task) => void;
}

const PRIORITY_VARIANT: Record<
  TaskPriorityLiteral,
  'danger' | 'warning' | 'success'
> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'success',
};

const CATEGORY_VARIANT: Record<string, 'default' | 'info' | 'warning'> = {
  'Follow-up': 'info',
  Deliverable: 'default',
  Admin: 'default',
  Renewal: 'warning',
  QBR: 'info',
  Onboarding: 'info',
};

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate) < new Date();
}

export function TaskItem({ task, onToggle, onClick }: TaskItemProps) {
  const overdue = isOverdue(task);
  const isDone = task.status === 'done';

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3 transition-all hover:border-border hover:bg-secondary/20',
        overdue && !isDone && 'border-red-500/30 bg-red-500/5',
        isDone && 'opacity-60'
      )}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
      />

      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={() => onClick(task)}
      >
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'truncate text-sm font-medium text-foreground',
              isDone && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
          {task.recurring && (
            <RepeatIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          )}
        </div>
        {task.client && (
          <p className="truncate text-xs text-muted-foreground">
            {task.client.name}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
        {task.category && (
          <Badge
            variant={CATEGORY_VARIANT[task.category] || 'default'}
            className="hidden sm:inline-flex"
          >
            {task.category}
          </Badge>
        )}
        {task.dueDate && (
          <span
            className={cn(
              'whitespace-nowrap text-xs',
              overdue && !isDone
                ? 'font-medium text-red-400'
                : 'text-muted-foreground'
            )}
          >
            {formatRelativeTime(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

export { isOverdue };
