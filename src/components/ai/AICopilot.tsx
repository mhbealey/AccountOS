"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  X,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  CalendarCheck,
  BarChart3,
  Mail,
  FileEdit,
  Newspaper,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = "prep" | "qbr" | "email" | "proposal" | "digest";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface TabState {
  loading: boolean;
  result: string | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: TabConfig[] = [
  { id: "prep", label: "Prep", icon: <CalendarCheck className="h-3.5 w-3.5" /> },
  { id: "qbr", label: "QBR", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
  { id: "proposal", label: "Proposal", icon: <FileEdit className="h-3.5 w-3.5" /> },
  { id: "digest", label: "Digest", icon: <Newspaper className="h-3.5 w-3.5" /> },
];

const MOCK_CLIENTS = [
  { id: "c1", name: "Acme Corp" },
  { id: "c2", name: "Globex Inc" },
  { id: "c3", name: "Initech" },
  { id: "c4", name: "Umbrella Corp" },
  { id: "c5", name: "Stark Industries" },
];

const EMAIL_TEMPLATES = [
  { id: "check-in", name: "Check-in" },
  { id: "follow-up", name: "Follow-up" },
  { id: "qbr-invite", name: "QBR Invitation" },
  { id: "renewal", name: "Renewal Discussion" },
  { id: "intro", name: "Introduction" },
  { id: "thank-you", name: "Thank You" },
];

const QUARTERS = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

// ---------------------------------------------------------------------------
// Mock AI generation (replace with real API calls)
// ---------------------------------------------------------------------------

async function simulateGenerate(tab: TabId, params: Record<string, string>): Promise<string> {
  await new Promise((res) => setTimeout(res, 1500 + Math.random() * 1000));

  const clientName = MOCK_CLIENTS.find((c) => c.id === params.clientId)?.name ?? "Client";

  switch (tab) {
    case "prep":
      return `## Meeting Prep: ${clientName}

### Relationship Summary
${clientName} has been an active client for 8 months with a current MRR of $4,200. Recent engagement has been strong with weekly check-ins and a positive sentiment trajectory.

### Key Talking Points
- **Q1 deliverables review** -- all 3 milestones completed on time
- **Upsell opportunity** -- they mentioned interest in analytics dashboard
- **Contract renewal** -- coming up in 60 days, prep renewal proposal
- **Team expansion** -- their design team is growing, potential for additional services

### Risks to Address
- Invoice #1042 is 5 days overdue -- follow up on payment
- Health score dipped from 82 to 74 last week due to reduced logins

### Opportunities
- Cross-sell data analytics package ($2,500/mo additional)
- Referral potential -- Sarah mentioned connections at two other companies

### Personal Touch
- Sarah's birthday is next month (April 28)
- Mike recently completed a marathon -- congratulate him`;

    case "qbr":
      return `## Quarterly Business Review: ${clientName}
### ${params.quarter || "Q1 2026"}

### Executive Summary
Strong quarter with 3/4 goals on track. Revenue grew 12% QoQ. Client satisfaction remains high with NPS of 9/10.

### Goals Review
| Goal | Status | Progress |
|------|--------|----------|
| Increase web traffic 25% | On Track | 22% achieved |
| Launch mobile app v2 | Completed | Delivered Feb 15 |
| Reduce support tickets 30% | At Risk | 18% reduction |
| Improve page load time | On Track | 1.8s (target: 1.5s) |

### Key Metrics
- **Revenue**: $12,600 (up 12% QoQ)
- **Hours Delivered**: 126 hours
- **Deliverables Completed**: 8 of 10 planned
- **Client Satisfaction**: 9/10

### Achievements
- Successfully launched mobile app v2 ahead of schedule
- Implemented new CI/CD pipeline reducing deploy time 60%
- Onboarded 2 new team members seamlessly

### Challenges
- Support ticket volume higher than expected
- Third-party API integration delays

### Next Quarter Recommendations
1. Prioritize support automation to hit ticket reduction goal
2. Begin planning for Phase 3 feature set
3. Schedule mid-quarter checkpoint for at-risk goals`;

    case "email":
      return `**Subject:** Checking in -- ${clientName} Partnership Update

Hi Sarah,

I hope this message finds you well! I wanted to reach out to touch base on how things have been going since our last conversation.

We have made great progress on the website redesign project -- the development team completed the new homepage design ahead of schedule, and initial user testing feedback has been very positive. I would love to walk you through the latest prototype at your convenience.

A few items I wanted to flag:
- The analytics dashboard wireframes are ready for your review
- We have an open question on the payment gateway integration timeline
- Our next milestone delivery is scheduled for April 15

Would you have 30 minutes this week for a quick sync? I am flexible on timing and happy to work around your schedule.

Looking forward to hearing from you!

Best regards`;

    case "proposal":
      return `## Proposal: ${clientName}

### Executive Summary
Based on our discovery conversations, ${clientName} requires a comprehensive digital transformation of their customer-facing platforms. This proposal outlines a phased approach to modernize their web presence, implement analytics tracking, and establish a scalable infrastructure.

### Problem Statement
${clientName} is experiencing declining user engagement due to outdated web infrastructure, lack of mobile optimization, and limited data visibility into customer behavior. Current systems cannot support their projected 3x growth over the next 18 months.

### Proposed Scope of Work

**Phase 1: Foundation (Weeks 1-4)**
- Technical audit and architecture design
- Design system creation
- Core infrastructure setup

**Phase 2: Build (Weeks 5-10)**
- Frontend development with responsive design
- Backend API development
- Analytics integration

**Phase 3: Launch & Optimize (Weeks 11-14)**
- QA testing and performance optimization
- Staged rollout with monitoring
- Team training and documentation

### Recommended Deliverables
1. Responsive web application
2. Admin dashboard with analytics
3. API documentation
4. Performance monitoring setup
5. Team training sessions (2x)`;

    case "digest":
      return `## Weekly Portfolio Digest
### Week of April 5, 2026

### Top 3 Priority Actions
1. **Umbrella Corp** -- Health score dropped to 58. Schedule urgent check-in call. _Impact: $3,800 MRR at risk_
2. **Acme Corp** -- Contract renewal in 30 days. Send renewal proposal. _Impact: $4,200 MRR retention_
3. **Initech** -- Proposal pending response for 7 days. Follow up with decision maker. _Impact: $6,500 potential new revenue_

### Engagement Decay Warnings
- **Globex Inc** -- No contact in 14 days (avg: 5 days)
- **Stark Industries** -- Last meeting was 21 days ago

### Revenue Summary
- **Active MRR**: $18,400
- **Pipeline Value**: $42,000
- **Invoices Outstanding**: $7,200 (2 overdue)
- **Revenue at Risk**: $3,800 (Umbrella Corp)

### Wins to Celebrate
- Closed deal with Stark Industries ($8,500 new MRR)
- Acme Corp NPS improved from 7 to 9
- 100% on-time delivery this week

### This Week's Focus
- Client retention: Address Umbrella Corp health decline
- Growth: Follow up on Initech proposal
- Operations: Clear overdue invoices`;

    default:
      return "No content generated.";
  }
}

// ---------------------------------------------------------------------------
// Markdown renderer (lightweight)
// ---------------------------------------------------------------------------

function MarkdownContent({ content }: { content: string }) {
  const html = React.useMemo(() => {
    let result = content
      // Tables
      .replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split("|").filter(Boolean).map((c) => c.trim());
        return `<tr>${cells.map((c) => `<td class="border border-border px-3 py-1.5 text-sm">${c}</td>`).join("")}</tr>`;
      })
      // Headings
      .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-foreground mt-4 mb-1.5">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-foreground mt-5 mb-2">$1</h2>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      // Italic
      .replace(/_(.+?)_/g, '<em class="text-muted-foreground italic">$1</em>')
      // Unordered list items
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-muted-foreground list-disc">$1</li>')
      // Ordered list items
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm text-muted-foreground list-decimal">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, "");

    // Wrap table rows
    result = result.replace(/(<tr>[\s\S]*?<\/tr>)+/g, (match) => {
      return `<table class="w-full border-collapse my-2">${match}</table>`;
    });

    return result;
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

interface AICopilotProps {
  defaultOpen?: boolean;
  defaultTab?: TabId;
  onClose?: () => void;
}

function AICopilot({ defaultOpen = false, defaultTab, onClose }: AICopilotProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [activeTab, setActiveTab] = React.useState<TabId>(defaultTab ?? "prep");
  const [copied, setCopied] = React.useState(false);

  // Per-tab state (cached results)
  const [tabStates, setTabStates] = React.useState<Record<TabId, TabState>>({
    prep: { loading: false, result: null, error: null },
    qbr: { loading: false, result: null, error: null },
    email: { loading: false, result: null, error: null },
    proposal: { loading: false, result: null, error: null },
    digest: { loading: false, result: null, error: null },
  });

  // Form state
  const [selectedClient, setSelectedClient] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [selectedQuarter, setSelectedQuarter] = React.useState(QUARTERS[0]);
  const [proposalNeeds, setProposalNeeds] = React.useState("");

  const currentState = tabStates[activeTab];

  // Sync with external open/close
  React.useEffect(() => {
    setIsOpen(defaultOpen);
    if (defaultOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultOpen, defaultTab]);

  function handleClose() {
    setIsOpen(false);
    onClose?.();
  }

  function updateTabState(tab: TabId, patch: Partial<TabState>) {
    setTabStates((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...patch },
    }));
  }

  async function handleGenerate() {
    const tab = activeTab;
    updateTabState(tab, { loading: true, error: null });

    try {
      const params: Record<string, string> = { clientId: selectedClient };
      if (tab === "qbr") params.quarter = selectedQuarter;
      if (tab === "email") params.template = selectedTemplate;
      if (tab === "proposal") params.needs = proposalNeeds;

      const result = await simulateGenerate(tab, params);
      updateTabState(tab, { loading: false, result, error: null });
    } catch {
      updateTabState(tab, {
        loading: false,
        error: "Something went wrong. Please check your API key and try again.",
      });
    }
  }

  async function handleCopy() {
    if (!currentState.result) return;
    try {
      await navigator.clipboard.writeText(currentState.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = currentState.result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const needsClient = activeTab !== "digest";
  const needsTemplate = activeTab === "email";
  const needsQuarter = activeTab === "qbr";
  const needsDescription = activeTab === "proposal";

  const canGenerate =
    (!needsClient || selectedClient) &&
    (!needsTemplate || selectedTemplate) &&
    !currentState.loading;

  // ---------------------------------------------------------------------------
  // Floating trigger button (always visible)
  // ---------------------------------------------------------------------------

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
        aria-label="Open AI Copilot"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Panel
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Floating trigger (dimmed when panel is open) */}
      <button
        onClick={handleClose}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Close AI Copilot"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Panel */}
      <div className="fixed bottom-0 right-0 top-0 z-30 w-full max-w-[400px] animate-in slide-in-from-right duration-200 border-l border-border bg-background flex flex-col shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">AI Copilot</span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-border px-3 py-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          {/* Form Controls */}
          <div className="space-y-3 mb-4">
            {needsClient && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Client
                </label>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Select a client...</option>
                  {MOCK_CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {needsQuarter && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Quarter
                </label>
                <Select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                >
                  {QUARTERS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {needsTemplate && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email Template
                </label>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Select a template...</option>
                  {EMAIL_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {needsDescription && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Describe Needs
                </label>
                <Textarea
                  value={proposalNeeds}
                  onChange={(e) => setProposalNeeds(e.target.value)}
                  placeholder="Describe the client's needs and project scope..."
                  className="min-h-[72px]"
                />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full"
            >
              {currentState.loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {currentState.error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p>{currentState.error}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 hover:no-underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {currentState.loading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Generating content...</span>
            </div>
          )}

          {/* Result */}
          {currentState.result && !currentState.loading && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Result
                </span>
                <div className="flex items-center gap-1">
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
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 overflow-y-auto">
                <MarkdownContent content={currentState.result} />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!currentState.result && !currentState.loading && !currentState.error && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {activeTab === "prep" && "Meeting Preparation"}
                  {activeTab === "qbr" && "QBR Generator"}
                  {activeTab === "email" && "Email Drafter"}
                  {activeTab === "proposal" && "Proposal Assist"}
                  {activeTab === "digest" && "Weekly Digest"}
                </p>
                <p className="mt-1 text-xs">
                  {activeTab === "prep" && "Select a client and generate a meeting brief with talking points, risks, and opportunities."}
                  {activeTab === "qbr" && "Select a client and quarter to generate a structured QBR document."}
                  {activeTab === "email" && "Pick a template and client to generate a personalized professional email."}
                  {activeTab === "proposal" && "Describe the client needs to generate proposal sections."}
                  {activeTab === "digest" && "One-click generation of your weekly portfolio summary and priorities."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export { AICopilot };
export type { TabId };
