'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TaskItem } from './TaskItem';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onClick }: TaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 10,
  });

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">No tasks to show</p>
      </div>
    );
  }

  // For small lists, render directly without virtualization
  if (tasks.length <= 50) {
    return (
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onClick={onClick}
          />
        ))}
      </div>
    );
  }

  // Virtual scrolling for large lists
  return (
    <div
      ref={parentRef}
      className="max-h-[calc(100vh-320px)] overflow-y-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index];
          return (
            <div
              key={task.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TaskItem task={task} onToggle={onToggle} onClick={onClick} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
