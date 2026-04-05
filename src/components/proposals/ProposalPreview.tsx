'use client';

import * as React from 'react';
import { type Proposal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProposalPreviewProps {
  proposal: Proposal;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n{2,}/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br />');
}

export function ProposalPreview({ proposal }: ProposalPreviewProps) {
  const deliverables = [...(proposal.deliverables ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="mx-auto max-w-3xl space-y-10 rounded-xl border border-border bg-[#0d0d24] p-10 shadow-xl">
      <header className="border-b border-border pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Proposal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">
              {proposal.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Prepared for {proposal.client?.name ?? 'Client'}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Type: {proposal.type}</p>
            {proposal.validUntil && (
              <p>Valid until: {formatDate(proposal.validUntil)}</p>
            )}
          </div>
        </div>
      </header>

      {proposal.executiveSummary && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Executive Summary
          </h2>
          <div
            className="text-sm text-foreground/80 leading-relaxed prose-invert"
            dangerouslySetInnerHTML={{
              __html: `<p>${renderMarkdown(proposal.executiveSummary)}</p>`,
            }}
          />
        </section>
      )}

      {proposal.problemStatement && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Problem Statement
          </h2>
          <div
            className="text-sm text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: `<p>${renderMarkdown(proposal.problemStatement)}</p>`,
            }}
          />
        </section>
      )}

      {proposal.scopeOfWork && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Scope of Work
          </h2>
          <div
            className="text-sm text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: `<p>${renderMarkdown(proposal.scopeOfWork)}</p>`,
            }}
          />
        </section>
      )}

      {deliverables.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Deliverables
          </h2>
          <div className="space-y-3">
            {deliverables.map((d, i) => (
              <div
                key={d.id}
                className="flex gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{d.title}</p>
                  {d.description && (
                    <p className="mt-1 text-sm text-foreground/70">
                      {d.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {proposal.timeline && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Timeline</h2>
          <div
            className="text-sm text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: `<p>${renderMarkdown(proposal.timeline)}</p>`,
            }}
          />
        </section>
      )}

      {(proposal.investment != null || proposal.paymentTerms) && (
        <section className="border-t border-border pt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Investment</h2>
          {proposal.investment != null && (
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(proposal.investment)}
              </span>
              <span className="text-sm text-muted-foreground">total</span>
            </div>
          )}
          {proposal.paymentTerms && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Payment Terms
              </p>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {proposal.paymentTerms}
              </p>
            </div>
          )}
        </section>
      )}

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        {proposal.validUntil && (
          <p>
            This proposal is valid until {formatDate(proposal.validUntil)}.
          </p>
        )}
        <p className="mt-1">
          Prepared with AccountOS
        </p>
      </footer>
    </div>
  );
}
