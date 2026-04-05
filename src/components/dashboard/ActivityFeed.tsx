'use client';

import React from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import {
  MessageSquare,
  FileText,
  DollarSign,
  UserPlus,
  Mail,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  clientName: string;
  clientId: string;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const activityIcons: Record<string, React.ReactNode> = {
  note: <MessageSquare className="h-4 w-4" />,
  invoice: <DollarSign className="h-4 w-4" />,
  contract: <FileText className="h-4 w-4" />,
  onboarding: <UserPlus className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  call: <PhoneCall className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  task: <CheckCircle2 className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  note: 'bg-blue-500/10 text-blue-400',
  invoice: 'bg-emerald-500/10 text-emerald-400',
  contract: 'bg-purple-500/10 text-purple-400',
  onboarding: 'bg-indigo-500/10 text-indigo-400',
  email: 'bg-sky-500/10 text-sky-400',
  call: 'bg-amber-500/10 text-amber-400',
  meeting: 'bg-pink-500/10 text-pink-400',
  task: 'bg-teal-500/10 text-teal-400',
};

function getIcon(type: string) {
  return activityIcons[type] || <Activity className="h-4 w-4" />;
}

function getColor(type: string) {
  return activityColors[type] || 'bg-slate-500/10 text-slate-400';
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-slate-400">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <Link
          key={activity.id}
          href={`/clients/${activity.clientId}`}
          className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
        >
          <div
            className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${getColor(activity.type)}`}
          >
            {getIcon(activity.type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
              {activity.title}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <span className="truncate text-indigo-400/80">
                {activity.clientName}
              </span>
              <span className="flex-shrink-0">·</span>
              <span className="flex-shrink-0">
                {formatRelativeTime(activity.createdAt)}
              </span>
            </div>
          </div>
          {index < activities.length - 1 && (
            <div className="absolute bottom-0 left-[1.85rem] top-10 w-px bg-[#1e1e3a]" />
          )}
        </Link>
      ))}
    </div>
  );
}
