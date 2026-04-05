'use client';

import * as React from 'react';
import {
  Phone,
  Send,
  Inbox,
  Users,
  FileText,
  BarChart3,
  Trophy,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  FileCheck,
  FileSignature,
  Rocket,
  MessageCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  ActivityType,
  Sentiment,
  type ActivityTypeLiteral,
  type SentimentLiteral,
  type Client,
  type Contact,
  type Activity,
} from '@/types';
import { generateId } from '@/lib/utils';

export const activityTypeIcons: Record<ActivityTypeLiteral, React.ElementType> = {
  call: Phone,
  email_sent: Send,
  email_received: Inbox,
  meeting: Users,
  note: FileText,
  qbr: BarChart3,
  milestone: Trophy,
  gift: Gift,
  referral_given: ArrowUpRight,
  referral_received: ArrowDownLeft,
  proposal_sent: FileCheck,
  contract_signed: FileSignature,
  onboarding_step: Rocket,
  check_in: MessageCircle,
};

export const activityTypeLabels: Record<ActivityTypeLiteral, string> = {
  call: 'Call',
  email_sent: 'Email Sent',
  email_received: 'Email Received',
  meeting: 'Meeting',
  note: 'Note',
  qbr: 'QBR',
  milestone: 'Milestone',
  gift: 'Gift',
  referral_given: 'Referral Given',
  referral_received: 'Referral Received',
  proposal_sent: 'Proposal Sent',
  contract_signed: 'Contract Signed',
  onboarding_step: 'Onboarding Step',
  check_in: 'Check-in',
};

interface QuickLogBarProps {
  clients: Client[];
  onSubmit: (activity: Activity) => void;
}

export function QuickLogBar({ clients, onSubmit }: QuickLogBarProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [type, setType] = React.useState<ActivityTypeLiteral>('call');
  const [title, setTitle] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [contactId, setContactId] = React.useState('');
  const [sentiment, setSentiment] = React.useState<SentimentLiteral>('Unknown');
  const [isKeyMoment, setIsKeyMoment] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [outcome, setOutcome] = React.useState('');

  const selectedClient = clients.find((c) => c.id === clientId);
  const contacts = selectedClient?.contacts ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const activity: Activity = {
      id: generateId(),
      clientId: clientId || null,
      contactId: contactId || null,
      dealId: null,
      type,
      title: title.trim(),
      description: description.trim() || null,
      date: new Date(),
      duration: null,
      outcome: outcome.trim() || null,
      sentiment,
      isKeyMoment,
      createdAt: new Date(),
    };

    onSubmit(activity);
    setTitle('');
    setDescription('');
    setOutcome('');
    setContactId('');
    setSentiment('Unknown');
    setIsKeyMoment(false);
    setExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as ActivityTypeLiteral)}
          className="w-44"
        >
          {Object.values(ActivityType).map((t) => (
            <option key={t} value={t}>
              {activityTypeLabels[t]}
            </option>
          ))}
        </Select>

        <Input
          placeholder="Activity title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[200px] flex-1"
          required
        />

        <Select
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setContactId('');
          }}
          className="w-44"
        >
          <option value="">No client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          className="w-40"
          disabled={!clientId || contacts.length === 0}
        >
          <option value="">No contact</option>
          {contacts.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.name}
            </option>
          ))}
        </Select>

        <Select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value as SentimentLiteral)}
          className="w-32"
        >
          {Object.values(Sentiment).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={isKeyMoment}
            onCheckedChange={(v) => setIsKeyMoment(v)}
          />
          <Label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Star className="h-3 w-3" />
            Key Moment
          </Label>
        </div>

        <Button type="submit" size="sm" disabled={!title.trim()}>
          <Plus className="h-4 w-4" />
          Log
        </Button>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> More
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              placeholder="What happened?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Outcome</Label>
            <Textarea
              placeholder="What was the result?"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}
    </form>
  );
}
