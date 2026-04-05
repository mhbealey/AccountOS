'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Sample data for preview
// ---------------------------------------------------------------------------

const SAMPLE_DATA: Record<string, string> = {
  '{{clientName}}':      'Acme Corp',
  '{{contactName}}':     'Sarah Johnson',
  '{{contactTitle}}':    'VP of Operations',
  '{{myName}}':          'Alex Morgan',
  '{{businessName}}':    'Morgan Consulting',
  '{{qbrDate}}':         'April 15, 2026',
  '{{contractEndDate}}': 'June 30, 2026',
  '{{invoiceNumber}}':   'INV-2026-042',
  '{{invoiceAmount}}':   '$4,500.00',
  '{{invoiceDueDate}}':  'April 20, 2026',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderTemplate(text: string): string {
  let rendered = text;
  for (const [key, value] of Object.entries(SAMPLE_DATA)) {
    rendered = rendered.replaceAll(key, value);
  }
  return rendered;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TemplatePreviewProps {
  subject: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemplatePreview({ subject, body }: TemplatePreviewProps) {
  const [copied, setCopied] = useState(false);

  const renderedSubject = useMemo(() => renderTemplate(subject), [subject]);
  const renderedBody = useMemo(() => renderTemplate(body), [body]);

  const handleCopy = async () => {
    const text = subject ? `Subject: ${renderedSubject}\n\n${renderedBody}` : renderedBody;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  if (!body.trim()) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Start writing in the body field to see a preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Preview (with sample data)</p>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
          {copied ? <Check className="h-3.5 w-3.5 text-[#22c55e]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
        {subject && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
            <p className="text-sm text-foreground font-medium">{renderedSubject}</p>
          </div>
        )}
        <div>
          {subject && <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>}
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {renderedBody}
          </div>
        </div>
      </div>
    </div>
  );
}
