'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeliverablesEditor } from './DeliverablesEditor';
import { type Proposal, type ProposalDeliverable } from '@/types';

export type SectionKey =
  | 'executiveSummary'
  | 'problemStatement'
  | 'scopeOfWork'
  | 'deliverables'
  | 'timeline'
  | 'investment'
  | 'validity';

interface ProposalSectionProps {
  section: SectionKey;
  proposal: Proposal;
  onUpdate: (updates: Partial<Proposal>) => void;
  onUpdateDeliverables: (deliverables: ProposalDeliverable[]) => void;
}

export function ProposalSection({
  section,
  proposal,
  onUpdate,
  onUpdateDeliverables,
}: ProposalSectionProps) {
  switch (section) {
    case 'executiveSummary':
      return (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Executive Summary
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Provide a high-level overview of the engagement. Supports markdown formatting.
            </p>
          </div>
          <Textarea
            value={proposal.executiveSummary ?? ''}
            onChange={(e) => onUpdate({ executiveSummary: e.target.value || null })}
            placeholder="Write the executive summary..."
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      );

    case 'problemStatement':
      return (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Problem Statement
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Define the problem or opportunity this proposal addresses.
            </p>
          </div>
          <Textarea
            value={proposal.problemStatement ?? ''}
            onChange={(e) =>
              onUpdate({ problemStatement: e.target.value || null })
            }
            placeholder="Describe the problem or opportunity..."
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      );

    case 'scopeOfWork':
      return (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Scope of Work
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Define what is included (and excluded) from this engagement. Markdown supported.
            </p>
          </div>
          <Textarea
            value={proposal.scopeOfWork ?? ''}
            onChange={(e) => onUpdate({ scopeOfWork: e.target.value || null })}
            placeholder="## Included\n- Item 1\n- Item 2\n\n## Excluded\n- Item 1"
            rows={16}
            className="font-mono text-sm"
          />
        </div>
      );

    case 'deliverables':
      return (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Deliverables
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              List all deliverables with descriptions. Drag to reorder.
            </p>
          </div>
          <DeliverablesEditor
            deliverables={proposal.deliverables ?? []}
            proposalId={proposal.id}
            onChange={onUpdateDeliverables}
          />
        </div>
      );

    case 'timeline':
      return (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Define project phases, milestones, and timeline. Use JSON or markdown.
            </p>
          </div>
          <Textarea
            value={proposal.timeline ?? ''}
            onChange={(e) => onUpdate({ timeline: e.target.value || null })}
            placeholder={'## Phase 1: Discovery (Weeks 1-2)\n- Stakeholder interviews\n- Current state assessment\n\n## Phase 2: Strategy (Weeks 3-4)\n- Recommendations development\n- Roadmap creation'}
            rows={16}
            className="font-mono text-sm"
          />
        </div>
      );

    case 'investment':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Investment</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Define the total fee and payment terms for this engagement.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Total Investment ($)
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={proposal.investment?.toString() ?? ''}
              onChange={(e) =>
                onUpdate({
                  investment: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="0.00"
              className="max-w-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Payment Terms
            </Label>
            <Textarea
              value={proposal.paymentTerms ?? ''}
              onChange={(e) =>
                onUpdate({ paymentTerms: e.target.value || null })
              }
              placeholder="e.g., 50% upon signing, 25% at midpoint, 25% upon completion"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </div>
      );

    case 'validity':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Validity
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Set the date until which this proposal remains valid.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Valid Until</Label>
            <Input
              type="date"
              value={
                proposal.validUntil
                  ? (typeof proposal.validUntil === 'string'
                      ? proposal.validUntil
                      : proposal.validUntil.toISOString()
                    ).slice(0, 10)
                  : ''
              }
              onChange={(e) =>
                onUpdate({
                  validUntil: e.target.value ? new Date(e.target.value) : null,
                })
              }
              className="max-w-xs"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
