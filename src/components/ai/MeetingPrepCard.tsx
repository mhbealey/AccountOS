"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  CalendarCheck,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data - replace with real API call
// ---------------------------------------------------------------------------

async function fetchMeetingPrep(clientId: string, clientName: string): Promise<string> {
  await new Promise((res) => setTimeout(res, 1500 + Math.random() * 1000));

  return `## Meeting Prep: ${clientName}

### Relationship Summary
${clientName} has been an active client for 8 months with a current MRR of $4,200. Recent engagement has been strong with weekly check-ins and positive sentiment.

### Key Talking Points
- **Q1 deliverables review** -- all 3 milestones completed on time
- **Upsell opportunity** -- interest mentioned in analytics dashboard
- **Contract renewal** -- coming up in 60 days
- **Team expansion** -- design team growing, potential for additional services

### Risks to Address
- Invoice #1042 is 5 days overdue -- follow up on payment
- Health score dipped from 82 to 74 last week

### Opportunities
- Cross-sell data analytics package ($2,500/mo additional)
- Referral potential -- Sarah mentioned connections at two other companies

### Personal Touch
- Sarah's birthday is next month (April 28)
- Mike recently completed a marathon -- congratulate him`;
}

// ---------------------------------------------------------------------------
// Markdown renderer (lightweight)
// ---------------------------------------------------------------------------

function MarkdownContent({ content }: { content: string }) {
  const html = React.useMemo(() => {
    return content
      .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-foreground mt-4 mb-1.5">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-foreground mt-5 mb-2">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      .replace(/_(.+?)_/g, '<em class="text-muted-foreground italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-muted-foreground list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm text-muted-foreground list-decimal">$1</li>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, "");
  }, [content]);

  return (
    <div
      className="prose-dark text-sm leading-relaxed text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MeetingPrepCardProps {
  clientId: string;
  clientName: string;
  className?: string;
}

function MeetingPrepCard({ clientId, clientName, className }: MeetingPrepCardProps) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const content = await fetchMeetingPrep(clientId, clientName);
      setResult(content);
    } catch {
      setError("Failed to generate meeting prep. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <CalendarCheck className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base">Meeting Prep</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {result && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Initial state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Generate an AI-powered meeting brief for {clientName} with talking points, risks, and opportunities.
            </p>
            <Button onClick={handleGenerate} size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Generate Meeting Prep
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Generating meeting prep for {clientName}...
            </span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button onClick={handleGenerate} size="sm" variant="outline">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="rounded-lg border border-border bg-secondary/50 p-4 max-h-[500px] overflow-y-auto">
            <MarkdownContent content={result} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { MeetingPrepCard };
