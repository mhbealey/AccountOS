'use client';

import * as React from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { type Activity } from '@/types';
import { ActivityItem } from './ActivityItem';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock } from 'lucide-react';

function formatDateHeader(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMMM d, yyyy');
}

function groupByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};
  for (const activity of activities) {
    const d = typeof activity.date === 'string' ? parseISO(activity.date) : activity.date;
    const key = format(d, 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(activity);
  }
  return groups;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityTimeline({ activities, onEdit, onDelete }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<Clock className="h-8 w-8" />}
        title="No activities yet"
        description="Use the quick-log bar above to record your first activity."
      />
    );
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groups = groupByDate(sorted);
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const dateActivities = groups[dateKey];
        const headerDate = dateActivities[0].date;

        return (
          <div key={dateKey}>
            <div className="sticky top-0 z-10 mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {formatDateHeader(headerDate)}
              </h3>
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground/60">
                {dateActivities.length} {dateActivities.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <div className="space-y-2">
              {dateActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
