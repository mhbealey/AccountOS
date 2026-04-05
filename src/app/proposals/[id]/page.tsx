'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProposalEditor } from '@/components/proposals/ProposalEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { type Proposal, type Client } from '@/types';

const DEMO_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Acme Corp',
    status: 'Active',
    industry: 'Tech',
    website: null,
    companySize: null,
    source: null,
    referredById: null,
    notes: null,
    mrr: 5000,
    contractValue: 60000,
    healthScore: 85,
    engagementScore: 80,
    satisfactionScore: 90,
    paymentScore: 95,
    adoptionScore: 85,
    csmPulse: 80,
    lastHealthUpdate: null,
    onboardedAt: null,
    firstValueAt: null,
    lastContactAt: new Date(),
    nextQbrDate: null,
    churnedAt: null,
    churnReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [],
  },
  {
    id: 'c2',
    name: 'Globex Inc',
    status: 'Active',
    industry: 'Finance',
    website: null,
    companySize: null,
    source: null,
    referredById: null,
    notes: null,
    mrr: 8000,
    contractValue: 96000,
    healthScore: 72,
    engagementScore: 70,
    satisfactionScore: 75,
    paymentScore: 90,
    adoptionScore: 60,
    csmPulse: 70,
    lastHealthUpdate: null,
    onboardedAt: null,
    firstValueAt: null,
    lastContactAt: new Date(),
    nextQbrDate: null,
    churnedAt: null,
    churnReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [],
  },
  {
    id: 'c3',
    name: 'Initech',
    status: 'Prospect',
    industry: 'SaaS',
    website: null,
    companySize: null,
    source: null,
    referredById: null,
    notes: null,
    mrr: 0,
    contractValue: 0,
    healthScore: 50,
    engagementScore: 40,
    satisfactionScore: null,
    paymentScore: 100,
    adoptionScore: null,
    csmPulse: 50,
    lastHealthUpdate: null,
    onboardedAt: null,
    firstValueAt: null,
    lastContactAt: null,
    nextQbrDate: null,
    churnedAt: null,
    churnReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [],
  },
];

const now = new Date();
const in30d = new Date(now.getTime() + 30 * 86400000);
const ago5d = new Date(now.getTime() - 5 * 86400000);
const ago20d = new Date(now.getTime() - 20 * 86400000);
const ago60d = new Date(now.getTime() - 60 * 86400000);

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    title: 'Acme Corp - Q2 Strategy Retainer',
    status: 'Draft',
    type: 'Retainer',
    executiveSummary:
      'We propose a continued strategic partnership for Q2, building on the momentum achieved in Q1. This retainer covers weekly strategy sessions, monthly performance reports, and quarterly business reviews.',
    problemStatement:
      'Acme Corp is navigating a critical market expansion phase. Without dedicated strategic guidance, the team risks losing focus on high-impact initiatives and falling behind competitors who are aggressively investing in market positioning.',
    scopeOfWork:
      '## Included\n- Weekly 60-minute strategy sessions\n- Monthly performance reports with KPI analysis\n- Quarterly business review preparation and facilitation\n- Ad-hoc advisory via email (48hr response time)\n- Access to resource library and templates\n\n## Excluded\n- Implementation or execution of recommended strategies\n- Third-party vendor management\n- Direct team management or HR activities',
    timeline:
      '## Phase 1: April (Onboarding)\n- Q1 retrospective and lessons learned\n- Q2 goal setting and OKR alignment\n- Baseline metrics establishment\n\n## Phase 2: May-June (Execution)\n- Weekly strategy sessions and progress tracking\n- Mid-quarter adjustment recommendations\n- Competitive landscape monitoring',
    investment: 15000,
    paymentTerms:
      'Monthly retainer of $5,000, billed on the 1st of each month. Net 15 payment terms.',
    validUntil: in30d,
    sentAt: null,
    acceptedAt: null,
    declinedReason: null,
    notes: null,
    createdAt: ago5d,
    updatedAt: ago5d,
    deliverables: [
      {
        id: 'd1',
        proposalId: 'p1',
        title: 'Weekly Strategy Sessions',
        description:
          '60-minute strategy calls every Monday to review progress, discuss blockers, and align on priorities.',
        sortOrder: 0,
      },
      {
        id: 'd2',
        proposalId: 'p1',
        title: 'Monthly Performance Report',
        description:
          'Comprehensive analysis of KPIs, competitive landscape, and strategic recommendations delivered by the 5th of each month.',
        sortOrder: 1,
      },
      {
        id: 'd3',
        proposalId: 'p1',
        title: 'Quarterly Business Review Deck',
        description:
          'Full QBR presentation covering achievements, learnings, and Q3 recommendations. Includes facilitation of the QBR meeting.',
        sortOrder: 2,
      },
    ],
  },
  {
    id: 'p2',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    title: 'Globex Inc - Website Redesign',
    status: 'Sent',
    type: 'Project',
    executiveSummary:
      'A complete redesign of the Globex corporate website to improve conversion rates and brand perception.',
    problemStatement: null,
    scopeOfWork: null,
    timeline: null,
    investment: 45000,
    paymentTerms: '50% upon signing, 25% at midpoint, 25% upon delivery.',
    validUntil: in30d,
    sentAt: ago5d,
    acceptedAt: null,
    declinedReason: null,
    notes: null,
    createdAt: ago20d,
    updatedAt: ago5d,
    deliverables: [],
  },
  {
    id: 'p3',
    clientId: 'c3',
    client: DEMO_CLIENTS[2],
    title: 'Initech - Digital Audit',
    status: 'Accepted',
    type: 'Consulting',
    executiveSummary: null,
    problemStatement: null,
    scopeOfWork: null,
    timeline: null,
    investment: 8000,
    paymentTerms: 'Due upon completion.',
    validUntil: ago5d,
    sentAt: ago60d,
    acceptedAt: ago20d,
    declinedReason: null,
    notes: null,
    createdAt: ago60d,
    updatedAt: ago20d,
    deliverables: [],
  },
];

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading from store/API
    const timer = setTimeout(() => {
      const found = DEMO_PROPOSALS.find((p) => p.id === id);
      if (found) {
        setProposal(found);
      } else {
        // If not found in demos, create a blank one (for newly created proposals)
        setNotFound(true);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  const handleUpdate = (updated: Proposal) => {
    setProposal(updated);
  };

  const handleBack = () => {
    router.push('/proposals');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-12 w-96" />
        <div className="flex gap-4">
          <Skeleton className="h-[600px] w-56" />
          <Skeleton className="h-[600px] flex-1" />
        </div>
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-xl font-semibold text-foreground">
          Proposal Not Found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The proposal you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={handleBack}
          className="mt-6 text-sm text-primary hover:underline"
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <ProposalEditor
        proposal={proposal}
        onUpdate={handleUpdate}
        onBack={handleBack}
      />
    </div>
  );
}
