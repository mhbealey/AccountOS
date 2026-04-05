'use client';

import * as React from 'react';
import {
  FileText,
  AlertCircle,
  Target,
  ListChecks,
  Clock,
  DollarSign,
  CalendarCheck,
  Eye,
  Save,
  Send,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProposalSection, type SectionKey } from './ProposalSection';
import { ProposalPreview } from './ProposalPreview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  type Proposal,
  type ProposalDeliverable,
  type ProposalStatusLiteral,
} from '@/types';

interface SectionNav {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: SectionNav[] = [
  { key: 'executiveSummary', label: 'Executive Summary', icon: FileText },
  { key: 'problemStatement', label: 'Problem Statement', icon: AlertCircle },
  { key: 'scopeOfWork', label: 'Scope of Work', icon: Target },
  { key: 'deliverables', label: 'Deliverables', icon: ListChecks },
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'investment', label: 'Investment', icon: DollarSign },
  { key: 'validity', label: 'Validity', icon: CalendarCheck },
];

function getStatusBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Sent':
      return 'info';
    case 'Accepted':
      return 'success';
    case 'Declined':
      return 'danger';
    case 'Expired':
      return 'warning';
    default:
      return 'default';
  }
}

interface ProposalEditorProps {
  proposal: Proposal;
  onUpdate: (proposal: Proposal) => void;
  onBack: () => void;
}

export function ProposalEditor({
  proposal,
  onUpdate,
  onBack,
}: ProposalEditorProps) {
  const [activeSection, setActiveSection] =
    React.useState<SectionKey>('executiveSummary');
  const [isPreview, setIsPreview] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(proposal.title);
  const [declineDialogOpen, setDeclineDialogOpen] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handlePartialUpdate = React.useCallback(
    (updates: Partial<Proposal>) => {
      onUpdate({ ...proposal, ...updates, updatedAt: new Date() });
    },
    [proposal, onUpdate]
  );

  const handleUpdateDeliverables = React.useCallback(
    (deliverables: ProposalDeliverable[]) => {
      onUpdate({ ...proposal, deliverables, updatedAt: new Date() });
    },
    [proposal, onUpdate]
  );

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      handlePartialUpdate({ title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  const handleSend = () => {
    handlePartialUpdate({
      status: 'Sent',
      sentAt: new Date(),
    });
  };

  const handleAccept = () => {
    handlePartialUpdate({
      status: 'Accepted',
      acceptedAt: new Date(),
    });
  };

  const handleDecline = () => {
    handlePartialUpdate({
      status: 'Declined',
      declinedReason: declineReason.trim() || null,
    });
    setDeclineDialogOpen(false);
    setDeclineReason('');
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b border-border px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTitleValue(proposal.title);
                  setEditingTitle(false);
                }
              }}
              className="h-8 text-lg font-bold max-w-md"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-lg font-bold text-foreground hover:text-primary transition-colors truncate block text-left"
            >
              {proposal.title}
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {proposal.client?.name ?? 'No client'}
          </p>
        </div>

        <Badge variant={getStatusBadgeVariant(proposal.status)}>
          {proposal.status}
        </Badge>

        <div className="flex items-center gap-2">
          {proposal.status === 'Draft' && (
            <Button size="sm" onClick={handleSend} className="gap-1">
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          )}
          {proposal.status === 'Sent' && (
            <>
              <Button
                size="sm"
                onClick={handleAccept}
                className="gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mark Accepted
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeclineDialogOpen(true)}
                className="gap-1"
              >
                <XCircle className="h-3.5 w-3.5" />
                Mark Declined
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant={isPreview ? 'default' : 'outline'}
            onClick={() => setIsPreview(!isPreview)}
            className="gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="gap-1"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saved' : 'Save'}
          </Button>
        </div>
      </header>

      {isPreview ? (
        <div className="flex-1 overflow-y-auto p-8 bg-background">
          <ProposalPreview proposal={proposal} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <nav className="w-56 shrink-0 border-r border-border bg-card/30 overflow-y-auto">
            <div className="p-3 space-y-0.5">
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeSection === key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              <ProposalSection
                section={activeSection}
                proposal={proposal}
                onUpdate={handlePartialUpdate}
                onUpdateDeliverables={handleUpdateDeliverables}
              />
            </div>
          </main>
        </div>
      )}

      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Proposal as Declined</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Reason for Decline (optional)
              </Label>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Why was this proposal declined?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeclineDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDecline}>
              Mark Declined
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
