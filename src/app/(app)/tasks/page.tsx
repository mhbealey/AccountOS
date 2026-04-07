'use client';

import { useState, useEffect, useMemo, KeyboardEvent } from 'react';
import {
  CheckSquare,
  Plus,
  X,
  Calendar,
  AlertCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import { cn, formatDate, getPriorityColor } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  priority: string;
  status: string;
  category: string;
  dueDate: string;
  completedAt: string | null;
  recurring: boolean;
  playbook: string | null;
  playbookStep: string | null;
}

const priorityOptions = ['Urgent', 'High', 'Medium', 'Low'];

function getPriorityBadgeColor(priority: string): string {
  const map: Record<string, string> = {
    Urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return map[priority] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function isToday(dueDate: string): boolean {
  const d = new Date(dueDate);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dueDate: string): boolean {
  const d = new Date(dueDate);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

type TabKey = 'today' | 'week' | 'all' | 'overdue';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Inline add state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newClient, setNewClient] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    fetch('/api/v1/tasks')
      .then((r) => r.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.clientId && t.clientName) map.set(t.clientId, t.clientName);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return tasks.filter((t) => t.dueDate && isToday(t.dueDate));
      case 'week':
        return tasks.filter((t) => t.dueDate && isThisWeek(t.dueDate));
      case 'overdue':
        return tasks.filter(
          (t) => t.status !== 'done' && t.dueDate && isOverdue(t.dueDate)
        );
      default:
        return tasks;
    }
  }, [tasks, activeTab]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'today', label: 'Today', count: tasks.filter((t) => t.dueDate && isToday(t.dueDate)).length },
    { key: 'week', label: 'This Week', count: tasks.filter((t) => t.dueDate && isThisWeek(t.dueDate)).length },
    { key: 'all', label: 'All', count: tasks.length },
    {
      key: 'overdue',
      label: 'Overdue',
      count: tasks.filter((t) => t.status !== 'done' && t.dueDate && isOverdue(t.dueDate)).length,
    },
  ];

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updated = {
      ...task,
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null,
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    try {
      await fetch(`/api/v1/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
    } catch {
      // silently fail, already removed from UI
    }
  }

  async function addTask(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || !newTitle.trim()) return;
    const payload = {
      title: newTitle.trim(),
      priority: newPriority,
      clientId: newClient || undefined,
      dueDate: newDueDate || undefined,
    };
    try {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setNewTitle('');
      setNewDueDate('');
    } catch {
      // handle error silently
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="text-[#00D4AA]" size={24} />
          <h1 className="text-2xl font-semibold text-[#F0F4F8]">Tasks</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0B1B2E] rounded-lg p-1 border border-[#1A3550] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                : 'text-[#829AB1] hover:text-[#F0F4F8]'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Inline Add */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Plus size={18} className="text-[#829AB1] shrink-0" />
          <input
            type="text"
            placeholder="Add a task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={addTask}
            className="flex-1 min-w-[200px] bg-transparent text-[#F0F4F8] placeholder-[#829AB1]/50 outline-none text-sm"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="bg-[#050E1A] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
          >
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            className="bg-[#050E1A] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="bg-[#050E1A] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] divide-y divide-[#1A3550]">
        {loading ? (
          <div className="p-8 text-center text-[#829AB1]">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-[#829AB1]">
            No tasks found for this view.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const done = task.status === 'done';
            const overdue =
              !done && task.dueDate && isOverdue(task.dueDate);
            return (
              <div
                key={task.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#1A3550]/30 transition-colors group"
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task)}
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    done
                      ? 'bg-[#00D4AA] border-[#00D4AA]'
                      : 'border-[#1A3550] hover:border-[#00D4AA]'
                  )}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#050E1A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Title */}
                <span
                  className={cn(
                    'flex-1 text-sm min-w-0 truncate',
                    done
                      ? 'line-through text-[#829AB1]/50'
                      : 'text-[#F0F4F8]'
                  )}
                >
                  {task.title}
                </span>

                {/* Priority Badge */}
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full border shrink-0',
                    getPriorityBadgeColor(task.priority)
                  )}
                >
                  {task.priority}
                </span>

                {/* Client */}
                {task.clientName && (
                  <span className="text-xs text-[#829AB1] shrink-0 hidden sm:inline">
                    {task.clientName}
                  </span>
                )}

                {/* Category Badge */}
                {task.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A3550]/50 text-[#829AB1] border border-[#1A3550] shrink-0 hidden md:inline">
                    {task.category}
                  </span>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <span
                    className={cn(
                      'text-xs shrink-0 flex items-center gap-1',
                      overdue ? 'text-red-400' : 'text-[#829AB1]'
                    )}
                  >
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                )}

                {/* Playbook Badge */}
                {task.playbook && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 shrink-0 hidden lg:inline-flex items-center gap-1">
                    <BookOpen size={10} />
                    {task.playbook}
                  </span>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className={cn(
                    'p-1 rounded hover:bg-red-500/10 text-red-400 transition-opacity shrink-0',
                    hoveredId === task.id ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
