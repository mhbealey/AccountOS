'use client';

import * as React from 'react';
import { Star, Pencil, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  type Activity,
  type SentimentLiteral,
  type ActivityTypeLiteral,
} from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { activityTypeIcons, activityTypeLabels } from './QuickLogBar';

const sentimentColors: Record<SentimentLiteral, string> = {
  Positive: 'bg-emerald-500',
  Neutral: 'bg-slate-400',
  Negative: 'bg-red-500',
  Unknown: 'bg-zinc-600',
};

const sentimentBadge: Record<SentimentLiteral, 'success' | 'default' | 'danger' | 'info'> = {
  Positive: 'success',
  Neutral: 'default',
  Negative: 'danger',
  Unknown: 'info',
};

interface ActivityItemProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityItem({ activity, onEdit, onDelete }: ActivityItemProps) {
  const [expanded, setExpanded] = React.useState(false);

  const IconComponent = activityTypeIcons[activity.type as ActivityTypeLiteral] ?? Clock;
  const typeLabel = activityTypeLabels[activity.type as ActivityTypeLiteral] ?? activity.type;
  const sentimentColor = sentimentColors[(activity.sentiment as SentimentLiteral) ?? 'Unknown'];

  return (
    <div
      className={`group relative rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-card ${
        activity.isKeyMoment ? 'border-l-4 border-l-yellow-500/70' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <IconComponent className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">{activity.title}</span>
            {activity.isKeyMoment && (
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            )}
            <Badge variant="default" className="text-[10px]">
              {typeLabel}
            </Badge>
            <span
              className={`h-2 w-2 rounded-full ${sentimentColor}`}
              title={activity.sentiment ?? 'Unknown'}
            />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {activity.client && (
              <span className="text-primary hover:underline cursor-pointer">
                {activity.client.name}
              </span>
            )}
            {activity.contact && (
              <>
                <span className="text-muted-foreground/50">/</span>
                <span>{activity.contact.name}</span>
              </>
            )}
            <span className="text-muted-foreground/50">--</span>
            <span>{formatRelativeTime(activity.date)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => onEdit(activity)}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(activity.id)}
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 ml-12 space-y-2 border-t border-border pt-3">
          {activity.description && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Description</span>
              <p className="mt-0.5 text-sm text-foreground/80 whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}
          {activity.outcome && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Outcome</span>
              <p className="mt-0.5 text-sm text-foreground/80 whitespace-pre-wrap">
                {activity.outcome}
              </p>
            </div>
          )}
          {activity.duration && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {activity.duration} minutes
            </div>
          )}
          {!activity.description && !activity.outcome && !activity.duration && (
            <p className="text-xs text-muted-foreground italic">No additional details</p>
          )}
        </div>
      )}
    </div>
  );
}
