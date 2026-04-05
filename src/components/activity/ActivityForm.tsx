'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  type Activity,
  type Client,
} from '@/types';
import { generateId } from '@/lib/utils';
import { activityTypeLabels } from './QuickLogBar';

interface ActivityFormProps {
  activity: Activity | null;
  clients: Client[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: Activity) => void;
}

export function ActivityForm({
  activity,
  clients,
  open,
  onOpenChange,
  onSave,
}: ActivityFormProps) {
  const [type, setType] = React.useState<ActivityTypeLiteral>('call');
  const [title, setTitle] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [contactId, setContactId] = React.useState('');
  const [sentiment, setSentiment] = React.useState<SentimentLiteral>('Unknown');
  const [isKeyMoment, setIsKeyMoment] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [outcome, setOutcome] = React.useState('');
  const [duration, setDuration] = React.useState('');
  const [date, setDate] = React.useState('');

  React.useEffect(() => {
    if (activity) {
      setType(activity.type);
      setTitle(activity.title);
      setClientId(activity.clientId ?? '');
      setContactId(activity.contactId ?? '');
      setSentiment((activity.sentiment as SentimentLiteral) ?? 'Unknown');
      setIsKeyMoment(activity.isKeyMoment);
      setDescription(activity.description ?? '');
      setOutcome(activity.outcome ?? '');
      setDuration(activity.duration?.toString() ?? '');
      const d = typeof activity.date === 'string' ? activity.date : activity.date.toISOString();
      setDate(d.slice(0, 16));
    } else {
      setType('call');
      setTitle('');
      setClientId('');
      setContactId('');
      setSentiment('Unknown');
      setIsKeyMoment(false);
      setDescription('');
      setOutcome('');
      setDuration('');
      setDate(new Date().toISOString().slice(0, 16));
    }
  }, [activity, open]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const contacts = selectedClient?.contacts ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const saved: Activity = {
      id: activity?.id ?? generateId(),
      clientId: clientId || null,
      contactId: contactId || null,
      dealId: activity?.dealId ?? null,
      type,
      title: title.trim(),
      description: description.trim() || null,
      date: date ? new Date(date) : new Date(),
      duration: duration ? parseInt(duration, 10) : null,
      outcome: outcome.trim() || null,
      sentiment,
      isKeyMoment,
      createdAt: activity?.createdAt ?? new Date(),
    };

    onSave(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'New Activity'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityTypeLiteral)}
              >
                {Object.values(ActivityType).map((t) => (
                  <option key={t} value={t}>
                    {activityTypeLabels[t]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity title"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Client</Label>
              <Select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setContactId('');
                }}
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contact</Label>
              <Select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                disabled={!clientId || contacts.length === 0}
              >
                <option value="">No contact</option>
                {contacts.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sentiment</Label>
              <Select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as SentimentLiteral)}
              >
                {Object.values(Sentiment).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Duration (min)</Label>
              <Input
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date & Time</Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened?"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Outcome</Label>
            <Textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="What was the result?"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isKeyMoment}
              onCheckedChange={(v) => setIsKeyMoment(v)}
            />
            <Label className="text-sm text-muted-foreground">
              Mark as Key Moment
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {activity ? 'Save Changes' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
