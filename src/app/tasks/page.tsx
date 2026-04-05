'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm, type TaskFormData } from '@/components/tasks/TaskForm';
import { toast } from '@/components/layout/Toast';
import {
  Plus,
  CalendarDays,
  CalendarRange,
  ListTodo,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Task, Client } from '@/types';

type TaskView = 'today' | 'week' | 'all' | 'overdue' | 'done';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<TaskView>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterClient, setFilterClient] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch {
      toast({ type: 'error', title: 'Failed to load tasks' });
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data.map((c: Client) => ({ id: c.id, name: c.name })));
    } catch {
      setClients([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchClients()]).finally(() =>
      setLoading(false)
    );
  }, [fetchTasks, fetchClients]);

  // Filter & view logic
  const applyFilters = useCallback(
    (taskList: Task[]): Task[] => {
      let result = taskList;
      if (filterClient) {
        result = result.filter((t) => t.clientId === filterClient);
      }
      if (filterPriority) {
        result = result.filter((t) => t.priority === filterPriority);
      }
      if (filterCategory) {
        result = result.filter((t) => t.category === filterCategory);
      }
      return result;
    },
    [filterClient, filterPriority, filterCategory]
  );

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = endOfDay(addDays(now, 7));

  const viewTasks = useMemo(() => {
    const map: Record<TaskView, Task[]> = {
      today: tasks.filter(
        (t) =>
          t.status !== 'done' &&
          t.dueDate &&
          new Date(t.dueDate) >= todayStart &&
          new Date(t.dueDate) <= todayEnd
      ),
      week: tasks.filter(
        (t) =>
          t.status !== 'done' &&
          t.dueDate &&
          new Date(t.dueDate) >= todayStart &&
          new Date(t.dueDate) <= weekEnd
      ),
      all: tasks.filter((t) => t.status !== 'done'),
      overdue: tasks.filter(
        (t) =>
          t.status !== 'done' &&
          t.dueDate &&
          new Date(t.dueDate) < todayStart
      ),
      done: tasks.filter((t) => t.status === 'done'),
    };
    return map;
  }, [tasks, todayStart, todayEnd, weekEnd]);

  const filteredTasks = useMemo(
    () => applyFilters(viewTasks[activeView]),
    [applyFilters, viewTasks, activeView]
  );

  const handleToggleTask = useCallback(
    async (task: Task) => {
      const newStatus = task.status === 'done' ? 'open' : 'done';

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: newStatus,
                completedAt:
                  newStatus === 'done' ? new Date() : null,
              }
            : t
        )
      );

      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) throw new Error('Failed to update task');

        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );

        if (newStatus === 'done') {
          toast({ type: 'success', title: 'Task completed' });

          // If recurring, show toast about next instance
          if (task.recurring) {
            const interval = task.recurring;
            const nextDate = task.dueDate
              ? calculateNextDate(new Date(task.dueDate), interval)
              : null;
            if (nextDate) {
              toast({
                type: 'info',
                title: `Next instance created for ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              });
            }
            // Refresh to pick up the new recurring instance
            await fetchTasks();
          }
        }
      } catch {
        await fetchTasks();
        toast({ type: 'error', title: 'Failed to update task' });
      }
    },
    [fetchTasks]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const handleCreateTask = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleFormSubmit = useCallback(
    async (data: TaskFormData) => {
      setSaving(true);
      try {
        const body = {
          ...data,
          clientId: data.clientId || undefined,
          description: data.description || undefined,
          category: data.category || undefined,
          dueDate: data.dueDate || undefined,
          recurring: data.recurring || undefined,
        };

        if (editingTask) {
          const res = await fetch(`/api/tasks/${editingTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed to update task');
          const updated = await res.json();
          setTasks((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
          toast({ type: 'success', title: 'Task updated' });
        } else {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed to create task');
          const created = await res.json();
          setTasks((prev) => [created, ...prev]);
          toast({ type: 'success', title: 'Task created' });
        }

        setFormOpen(false);
        setEditingTask(null);
      } catch {
        toast({
          type: 'error',
          title: editingTask
            ? 'Failed to update task'
            : 'Failed to create task',
        });
      } finally {
        setSaving(false);
      }
    },
    [editingTask]
  );

  const hasFilters = !!(filterClient || filterPriority || filterCategory);

  const clearFilters = () => {
    setFilterClient('');
    setFilterPriority('');
    setFilterCategory('');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks and to-dos
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters
        clients={clients}
        filterClient={filterClient}
        filterPriority={filterPriority}
        filterCategory={filterCategory}
        onFilterClientChange={setFilterClient}
        onFilterPriorityChange={setFilterPriority}
        onFilterCategoryChange={setFilterCategory}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      {/* Tabs */}
      <Tabs
        defaultValue="today"
        value={activeView}
        onValueChange={(v) => setActiveView(v as TaskView)}
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="today" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Today
            {viewTasks.today.length > 0 && (
              <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1.5">
                {viewTasks.today.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-1.5">
            <CalendarRange className="h-3.5 w-3.5" />
            This Week
            {viewTasks.week.length > 0 && (
              <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1.5">
                {viewTasks.week.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <ListTodo className="h-3.5 w-3.5" />
            All
            {viewTasks.all.length > 0 && (
              <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1.5">
                {viewTasks.all.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Overdue
            {viewTasks.overdue.length > 0 && (
              <Badge variant="danger" className="ml-1 h-5 min-w-[20px] px-1.5">
                {viewTasks.overdue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="done" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Done
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <TabsContent value="today">
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onClick={handleTaskClick}
              />
            </TabsContent>
            <TabsContent value="week">
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onClick={handleTaskClick}
              />
            </TabsContent>
            <TabsContent value="all">
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onClick={handleTaskClick}
              />
            </TabsContent>
            <TabsContent value="overdue">
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onClick={handleTaskClick}
              />
            </TabsContent>
            <TabsContent value="done">
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onClick={handleTaskClick}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Task Form Modal */}
      <TaskForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        clients={clients}
        onSubmit={handleFormSubmit}
        isLoading={saving}
      />
    </div>
  );
}

/** Calculate next recurrence date from a base date and interval */
function calculateNextDate(base: Date, interval: string): Date {
  const next = new Date(base);
  const now = new Date();

  // Advance by interval
  switch (interval) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    default:
      next.setDate(next.getDate() + 7);
  }

  // If still in the past, skip forward to next future occurrence
  while (next < now) {
    switch (interval) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      default:
        next.setDate(next.getDate() + 7);
    }
  }

  return next;
}
