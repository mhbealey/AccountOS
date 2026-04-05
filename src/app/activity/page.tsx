'use client';

import * as React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import { QuickLogBar } from '@/components/activity/QuickLogBar';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { ActivityForm } from '@/components/activity/ActivityForm';
import { ActivityFilters, type ActivityFilterValues } from '@/components/activity/ActivityFilters';
import { type Activity, type Client } from '@/types';

const DEMO_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Acme Corp',
    status: 'Active',
    industry: 'Tech',
    website: null,
    companySize: null,
    source: null,
    referredById: null,
    notes: null,
    mrr: 5000,
    contractValue: 60000,
    healthScore: 85,
    engagementScore: 80,
    satisfactionScore: 90,
    paymentScore: 95,
    adoptionScore: 85,
    csmPulse: 80,
    lastHealthUpdate: null,
    onboardedAt: null,
    firstValueAt: null,
    lastContactAt: new Date(),
    nextQbrDate: null,
    churnedAt: null,
    churnReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [
      {
        id: 'ct1',
        clientId: 'c1',
        name: 'Jane Smith',
        title: 'VP of Ops',
        email: 'jane@acme.com',
        phone: null,
        role: 'DecisionMaker',
        sentiment: 'Positive',
        isPrimary: true,
        isExecutive: true,
        notes: null,
        lastContactAt: null,
        linkedinUrl: null,
        birthday: null,
        interests: null,
        createdAt: new Date(),
      },
      {
        id: 'ct2',
        clientId: 'c1',
        name: 'Bob Lee',
        title: 'Project Lead',
        email: 'bob@acme.com',
        phone: null,
        role: 'Champion',
        sentiment: 'Neutral',
        isPrimary: false,
        isExecutive: false,
        notes: null,
        lastContactAt: null,
        linkedinUrl: null,
        birthday: null,
        interests: null,
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 'c2',
    name: 'Globex Inc',
    status: 'Active',
    industry: 'Finance',
    website: null,
    companySize: null,
    source: null,
    referredById: null,
    notes: null,
    mrr: 8000,
    contractValue: 96000,
    healthScore: 72,
    engagementScore: 70,
    satisfactionScore: 75,
    paymentScore: 90,
    adoptionScore: 60,
    csmPulse: 70,
    lastHealthUpdate: null,
    onboardedAt: null,
    firstValueAt: null,
    lastContactAt: new Date(),
    nextQbrDate: null,
    churnedAt: null,
    churnReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [
      {
        id: 'ct3',
        clientId: 'c2',
        name: 'Sarah Connor',
        title: 'CEO',
        email: 'sarah@globex.com',
        phone: null,
        role: 'DecisionMaker',
        sentiment: 'Positive',
        isPrimary: true,
        isExecutive: true,
        notes: null,
        lastContactAt: null,
        linkedinUrl: null,
        birthday: null,
        interests: null,
        createdAt: new Date(),
      },
    ],
  },
];

const DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    contactId: 'ct1',
    contact: DEMO_CLIENTS[0].contacts![0],
    dealId: null,
    type: 'call',
    title: 'Q2 planning call with Jane',
    description: 'Discussed Q2 priorities and budget allocation for the new product launch.',
    date: new Date(),
    duration: 45,
    outcome: 'Aligned on deliverables. Follow-up meeting scheduled for next week.',
    sentiment: 'Positive',
    isKeyMoment: true,
    createdAt: new Date(),
  },
  {
    id: 'a2',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    contactId: 'ct2',
    contact: DEMO_CLIENTS[0].contacts![1],
    dealId: null,
    type: 'email_sent',
    title: 'Sent project update report',
    description: null,
    date: new Date(),
    duration: null,
    outcome: null,
    sentiment: 'Neutral',
    isKeyMoment: false,
    createdAt: new Date(),
  },
  {
    id: 'a3',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    contactId: 'ct3',
    contact: DEMO_CLIENTS[1].contacts![0],
    dealId: null,
    type: 'meeting',
    title: 'QBR preparation meeting',
    description: 'Reviewed metrics and prepared deck for upcoming quarterly business review.',
    date: new Date(Date.now() - 86400000),
    duration: 60,
    outcome: 'Deck finalized. QBR scheduled for Friday.',
    sentiment: 'Positive',
    isKeyMoment: false,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'a4',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    contactId: null,
    dealId: null,
    type: 'note',
    title: 'Client mentioned potential churn risk',
    description: 'Sarah hinted they are evaluating other vendors. Need to address this quickly.',
    date: new Date(Date.now() - 86400000),
    duration: null,
    outcome: null,
    sentiment: 'Negative',
    isKeyMoment: true,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'a5',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    contactId: null,
    dealId: null,
    type: 'milestone',
    title: 'Completed Phase 1 deliverables',
    description: 'All Phase 1 deliverables reviewed and approved by the client.',
    date: new Date(Date.now() - 172800000),
    duration: null,
    outcome: 'Phase 2 kickoff next Monday.',
    sentiment: 'Positive',
    isKeyMoment: true,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export default function ActivityPage() {
  const [activities, setActivities] = React.useState<Activity[]>(DEMO_ACTIVITIES);
  const [editActivity, setEditActivity] = React.useState<Activity | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<ActivityFilterValues>({
    clientId: '',
    type: '',
    sentiment: '',
    dateFrom: '',
    dateTo: '',
    keyMomentsOnly: false,
  });

  const handleQuickLog = (activity: Activity) => {
    setActivities((prev) => [activity, ...prev]);
  };

  const handleEdit = (activity: Activity) => {
    setEditActivity(activity);
    setFormOpen(true);
  };

  const handleSave = (activity: Activity) => {
    setActivities((prev) => {
      const idx = prev.findIndex((a) => a.id === activity.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = activity;
        return updated;
      }
      return [activity, ...prev];
    });
    setEditActivity(null);
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredActivities = React.useMemo(() => {
    return activities.filter((a) => {
      if (filters.clientId && a.clientId !== filters.clientId) return false;
      if (filters.type && a.type !== filters.type) return false;
      if (filters.sentiment && a.sentiment !== filters.sentiment) return false;
      if (filters.keyMomentsOnly && !a.isKeyMoment) return false;

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        const actDate = new Date(a.date);
        if (actDate < from) return false;
      }

      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        const actDate = new Date(a.date);
        if (actDate > to) return false;
      }

      return true;
    });
  }, [activities, filters]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
          <ActivityIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground">
            Track every interaction across your accounts
          </p>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
        </div>
      </div>

      <QuickLogBar clients={DEMO_CLIENTS} onSubmit={handleQuickLog} />

      <ActivityFilters
        clients={DEMO_CLIENTS}
        filters={filters}
        onChange={setFilters}
      />

      <ActivityTimeline
        activities={filteredActivities}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ActivityForm
        activity={editActivity}
        clients={DEMO_CLIENTS}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditActivity(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
