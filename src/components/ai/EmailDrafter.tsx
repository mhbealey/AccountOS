"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Mail,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Pencil,
  Eye,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMAIL_TEMPLATES = [
  { id: "check-in", name: "Check-in", category: "Relationship" },
  { id: "follow-up", name: "Follow-up", category: "Relationship" },
  { id: "qbr-invite", name: "QBR Invitation", category: "Business Review" },
  { id: "renewal", name: "Renewal Discussion", category: "Contract" },
  { id: "intro", name: "Introduction", category: "Onboarding" },
  { id: "thank-you", name: "Thank You", category: "Relationship" },
  { id: "proposal-followup", name: "Proposal Follow-up", category: "Sales" },
  { id: "milestone", name: "Milestone Update", category: "Delivery" },
];

const TEMPLATE_CATEGORIES = [...new Set(EMAIL_TEMPLATES.map((t) => t.category))];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CLIENTS = [
  { id: "c1", name: "Acme Corp", contactName: "Sarah Chen", contactEmail: "sarah@acme.com" },
  { id: "c2", name: "Globex Inc", contactName: "Mike Johnson", contactEmail: "mike@globex.com" },
  { id: "c3", name: "Initech", contactName: "Lisa Park", contactEmail: "lisa@initech.com" },
  { id: "c4", name: "Umbrella Corp", contactName: "Tom Harris", contactEmail: "tom@umbrella.com" },
  { id: "c5", name: "Stark Industries", contactName: "Jane Doe", contactEmail: "jane@stark.com" },
];

interface GeneratedEmail {
  subject: string;
  body: string;
}

async function generateEmail(
  templateId: string,
  clientId: string
): Promise<GeneratedEmail> {
  await new Promise((res) => setTimeout(res, 1500 + Math.random() * 1000));

  const client = MOCK_CLIENTS.find((c) => c.id === clientId);
  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
  const contactName = client?.contactName ?? "there";
  const companyName = client?.name ?? "your company";

  const emails: Record<string, GeneratedEmail> = {
    "check-in": {
      subject: `Checking in -- ${companyName} Partnership Update`,
      body: `Hi ${contactName},

I hope this message finds you well! I wanted to reach out to touch base on how things have been going since our last conversation.

We have made great progress on our current projects together, and I wanted to make sure everything is meeting your expectations. A few things I wanted to highlight:

- The latest deliverables were completed ahead of schedule
- Our team has been working on some exciting improvements that I think you will love
- I have a few ideas for how we can further optimize your results

Would you have 30 minutes this week for a quick sync? I am flexible on timing and happy to work around your schedule.

Looking forward to hearing from you!

Best regards`,
    },
    "follow-up": {
      subject: `Following up -- Next steps for ${companyName}`,
      body: `Hi ${contactName},

Thank you for taking the time to meet with me earlier. I really enjoyed our conversation and wanted to follow up on a few items we discussed.

Here is a summary of the key takeaways and next steps:

1. We will prepare the updated project timeline by end of this week
2. Our design team will share revised mockups for your review
3. I will schedule a follow-up call for next Tuesday to discuss feedback

Please let me know if I missed anything or if you have any additional thoughts. I want to make sure we are fully aligned before moving forward.

Looking forward to our continued partnership!

Best regards`,
    },
    "qbr-invite": {
      subject: `Quarterly Business Review Invitation -- ${companyName}`,
      body: `Hi ${contactName},

I hope you are doing well! I wanted to reach out to schedule our upcoming Quarterly Business Review (QBR).

During this session, we will cover:

- Review of Q1 goals and achievements
- Key metrics and performance data
- Challenges and areas for improvement
- Strategic planning for next quarter
- Open discussion and feedback

I would suggest we schedule this for sometime in the next two weeks. The meeting typically runs about 60-90 minutes.

Could you share a few time slots that work for your team? I want to make sure we have all the key stakeholders available.

Please feel free to share any specific topics you would like us to address in advance so we can prepare accordingly.

Best regards`,
    },
    "renewal": {
      subject: `Partnership Renewal -- ${companyName}`,
      body: `Hi ${contactName},

I hope this email finds you well. I wanted to reach out regarding our upcoming contract renewal.

As we approach the renewal date, I wanted to take a moment to reflect on what we have accomplished together:

- Successfully delivered all planned milestones on schedule
- Achieved a 15% improvement in key performance metrics
- Maintained a strong collaborative working relationship

I would love to discuss how we can continue to build on this success in our next term. I have been thinking about some exciting new opportunities that could deliver even more value for ${companyName}.

Would you be available for a call this week to discuss the renewal terms and any adjustments you would like to explore?

Looking forward to continuing our partnership!

Best regards`,
    },
    "intro": {
      subject: `Welcome aboard -- Getting started with ${companyName}`,
      body: `Hi ${contactName},

Welcome! We are thrilled to officially kick off our partnership with ${companyName}.

To get us started on the right foot, here is what you can expect over the next few weeks:

**Week 1: Onboarding**
- Kickoff meeting to align on goals and expectations
- Access setup for all relevant tools and platforms
- Introduction to your dedicated team

**Week 2: Discovery**
- Deep dive into your current processes and challenges
- Stakeholder interviews
- Initial assessment and recommendations

**Week 3: Planning**
- Detailed project plan and timeline
- Resource allocation
- First milestone targets

I have attached our onboarding guide for your reference. Please review it at your convenience and let me know if you have any questions.

I will be your primary point of contact throughout this process. Do not hesitate to reach out anytime!

Best regards`,
    },
    "thank-you": {
      subject: `Thank you -- ${companyName}`,
      body: `Hi ${contactName},

I just wanted to take a moment to say thank you for your continued trust and partnership. Working with ${companyName} has been a truly rewarding experience.

Your team's collaboration, responsiveness, and commitment to excellence have made our work together seamless. The results we have achieved are a testament to what great partnership looks like.

I am excited about what lies ahead and the opportunities we have to continue delivering exceptional results together.

If there is ever anything I can do to better serve you and your team, please do not hesitate to let me know.

With gratitude`,
    },
    "proposal-followup": {
      subject: `Proposal follow-up -- ${companyName}`,
      body: `Hi ${contactName},

I wanted to follow up on the proposal I sent over last week. I hope you have had a chance to review it.

I am confident that the approach we have outlined will address the challenges we discussed and deliver meaningful results for ${companyName}. Here are a few highlights:

- Phased approach to minimize disruption
- Clear deliverables and milestones at every stage
- Flexible terms that align with your budget cycle

I would love to schedule a brief call to walk through any questions you might have and discuss potential next steps. I am also happy to make adjustments based on your feedback.

What does your availability look like this week?

Best regards`,
    },
    "milestone": {
      subject: `Milestone Update -- ${companyName} Project Progress`,
      body: `Hi ${contactName},

I am excited to share that we have reached an important milestone in our project together!

**Milestone Completed: Phase 2 Delivery**

Here is a summary of what was accomplished:
- All planned deliverables completed on schedule
- Quality benchmarks met or exceeded
- User acceptance testing passed with zero critical issues

**Key Metrics:**
- On-time delivery rate: 100%
- Quality score: 98/100
- Team utilization: 94%

**Next Steps:**
- Begin Phase 3 planning next week
- Schedule review session with your team
- Update project timeline with refined estimates

Great work by both our teams in making this happen. I look forward to building on this momentum.

Best regards`,
    },
  };

  return (
    emails[templateId] ?? {
      subject: `Update from your account manager -- ${companyName}`,
      body: `Hi ${contactName},\n\nI wanted to reach out with a quick update. Please let me know if you have any questions.\n\nBest regards`,
    }
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EmailDrafterProps {
  defaultClientId?: string;
  className?: string;
}

function EmailDrafter({ defaultClientId, className }: EmailDrafterProps) {
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [selectedClient, setSelectedClient] = React.useState(defaultClientId ?? "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = React.useState<GeneratedEmail | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editedSubject, setEditedSubject] = React.useState("");
  const [editedBody, setEditedBody] = React.useState("");
  const [copiedSubject, setCopiedSubject] = React.useState(false);
  const [copiedBody, setCopiedBody] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);

  const filteredTemplates = selectedCategory
    ? EMAIL_TEMPLATES.filter((t) => t.category === selectedCategory)
    : EMAIL_TEMPLATES;

  const selectedClientData = MOCK_CLIENTS.find((c) => c.id === selectedClient);

  const canGenerate = selectedTemplate && selectedClient && !loading;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setEditMode(false);
    try {
      const email = await generateEmail(selectedTemplate, selectedClient);
      setGeneratedEmail(email);
      setEditedSubject(email.subject);
      setEditedBody(email.body);
    } catch {
      setError("Failed to generate email. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string, setter: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  function handleCopyAll() {
    const subject = editMode ? editedSubject : (generatedEmail?.subject ?? "");
    const body = editMode ? editedBody : (generatedEmail?.body ?? "");
    copyToClipboard(`Subject: ${subject}\n\n${body}`, setCopiedAll);
  }

  const displaySubject = editMode ? editedSubject : (generatedEmail?.subject ?? "");
  const displayBody = editMode ? editedBody : (generatedEmail?.body ?? "");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Mail className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-base">Email Drafter</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedTemplate("");
              }}
            >
              <option value="">All categories</option>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Template
            </label>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Select template...</option>
              {filteredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Client
          </label>
          <Select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Select client...</option>
            {MOCK_CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.contactName})
              </option>
            ))}
          </Select>
          {selectedClientData && (
            <p className="mt-1 text-xs text-muted-foreground">
              To: {selectedClientData.contactName} &lt;{selectedClientData.contactEmail}&gt;
            </p>
          )}
        </div>

        <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Email
            </>
          )}
        </Button>

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
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
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Drafting your email...</span>
          </div>
        )}

        {/* Result */}
        {generatedEmail && !loading && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    !editMode
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    editMode
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copiedAll ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy All
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="rounded-lg border border-border bg-secondary/50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Subject</span>
                <button
                  onClick={() =>
                    copyToClipboard(displaySubject, setCopiedSubject)
                  }
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedSubject ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              {editMode ? (
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <div className="px-3 py-2.5 text-sm text-foreground">
                  {displaySubject}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="rounded-lg border border-border bg-secondary/50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Body</span>
                <button
                  onClick={() => copyToClipboard(displayBody, setCopiedBody)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedBody ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              {editMode ? (
                <Textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="min-h-[300px] border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-y"
                />
              ) : (
                <div className="max-h-[400px] overflow-y-auto px-3 py-2.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {displayBody}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { EmailDrafter };
