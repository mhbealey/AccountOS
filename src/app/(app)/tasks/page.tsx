'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Circle, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string | null;
  clientId: string | null;
  clientName: string | null;
  createdAt: string;
};

type FilterTab = 'all' | 'todo' | 'in_progress' | 'done';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-[#FF6B6B]/20 text-[#FF6B6B]',
  high: 'bg-[#FFB347]/20 text-[#FFB347]',
  medium: 'bg-[#829AB1]/20 text-[#829AB1]',
  low: 'bg-[#829AB1]/10 text-[#829AB1]/70',
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDue(dueDate: string): string {
  const d = new Date(dueDate);
  const now = new Date();
  const diffMs = d.getTime() - new Date(now.toDateString()).getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return `In ${diffDays}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;

    setNewTitle('');

    const tempId = `temp-${Date.now()}`;
    const optimistic: Task = {
      id: tempId,
      title,
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      clientId: null,
      clientName: null,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? data.task ?? data : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    }
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks((t) => t.filter((task) => task.id !== id));
    setSwipedId(null);

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch {
      setTasks(prev);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    if (swipedId && swipedId !== id) setSwipedId(null);
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 80) {
      setSwipedId(id);
    } else if (diff < -40) {
      setSwipedId(null);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="min-h-full bg-[#050E1A]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050E1A]/95 backdrop-blur-sm border-b border-[#1A3550]">
        <div className="px-4 pt-6 pb-3">
          <h1 className="text-2xl font-semibold text-[#F0F4F8]">Tasks</h1>
        </div>

        {/* Add task input */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 bg-[#0B1B2E] rounded-lg border border-[#1A3550] px-3 py-2.5 focus-within:border-[#00D4AA]/50 transition-colors">
            <Plus className="w-4 h-4 text-[#829AB1] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a task..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTask();
              }}
              className="flex-1 bg-transparent text-[#F0F4F8] placeholder:text-[#829AB1]/60 text-sm outline-none"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === tab.key
                  ? 'bg-[#00D4AA]/15 text-[#00D4AA]'
                  : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#0D2137]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="divide-y divide-[#1A3550]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#00D4AA]/30 border-t-[#00D4AA] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#829AB1] text-sm">
            {filter === 'all' ? 'No tasks yet. Add one above.' : 'No tasks match this filter.'}
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="relative overflow-hidden group"
              onTouchStart={(e) => handleTouchStart(e, task.id)}
              onTouchEnd={(e) => handleTouchEnd(e, task.id)}
            >
              {/* Delete zone (swipe reveal) */}
              <div className="absolute inset-y-0 right-0 w-20 bg-[#FF6B6B] flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>

              {/* Task row */}
              <div
                className={cn(
                  'relative bg-[#0B1B2E] p-4 flex items-start gap-3 transition-transform duration-200',
                  swipedId === task.id ? '-translate-x-20' : 'translate-x-0'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task)}
                  className="shrink-0 mt-0.5 transition-colors"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00D4AA]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#829AB1] hover:text-[#00D4AA]" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        task.status === 'done'
                          ? 'line-through text-[#829AB1]/60'
                          : 'text-[#F0F4F8]'
                      )}
                    >
                      {task.title}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded',
                        PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    {task.clientName && (
                      <span className="text-xs text-[#829AB1] hover:text-[#00D4AA] cursor-pointer transition-colors truncate">
                        {task.clientName}
                      </span>
                    )}
                    {task.dueDate && (
                      <span
                        className={cn(
                          'text-xs shrink-0',
                          isOverdue(task.dueDate) && task.status !== 'done'
                            ? 'text-[#FF6B6B]'
                            : 'text-[#829AB1]'
                        )}
                      >
                        {formatDue(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button (hover, desktop) */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-[#FF6B6B] text-[#829AB1]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tappable delete zone when swiped */}
              {swipedId === task.id && (
                <button
                  onClick={() => deleteTask(task.id)}
                  className="absolute inset-y-0 right-0 w-20"
                  aria-label="Delete task"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
