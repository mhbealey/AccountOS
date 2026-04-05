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
import { Label } from '@/components/ui/label';
import { type Client } from '@/types';

interface ProposalFormProps {
  clients: Client[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; clientId: string; type: string }) => void;
}

const PROPOSAL_TYPES = [
  'Retainer',
  'Project',
  'Consulting',
  'Advisory',
  'Strategy',
  'Audit',
  'Custom',
];

export function ProposalForm({
  clients,
  open,
  onOpenChange,
  onSubmit,
}: ProposalFormProps) {
  const [title, setTitle] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [type, setType] = React.useState('Retainer');

  React.useEffect(() => {
    if (open) {
      setTitle('');
      setClientId('');
      setType('Retainer');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    onSubmit({ title: title.trim(), clientId, type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Proposal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Client *</Label>
            <Select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {PROPOSAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !clientId}>
              Create Proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
