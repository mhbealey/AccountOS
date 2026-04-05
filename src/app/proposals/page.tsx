'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileCheck,
  Plus,
  Filter,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { ProposalForm } from '@/components/proposals/ProposalForm';
import {
  ProposalStatus,
  type Proposal,
  type ProposalStatusLiteral,
  type Client,
} from '@/types';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';

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

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    title: 'Acme Corp - Q2 Strategy Retainer',
    status: 'Draft',
    type: 'Retainer',
    executiveSummary: 'We propose a continued strategic partnership for Q2, building on the momentum achieved in Q1.',
    problemStatement: 'Acme needs ongoing strategic guidance to navigate market expansion.',
    scopeOfWork: '## Included\n- Weekly strategy sessions\n- Monthly reports\n- Ad-hoc advisory\n\n## Excluded\n- Implementation work\n- Third-party vendor management',
    timeline: '## Phase 1: April\n- Q1 retrospective\n- Q2 goal setting\n\n## Phase 2: May-June\n- Execution and optimization',
    investment: 15000,
    paymentTerms: 'Monthly retainer of $5,000, billed on the 1st of each month.',
    validUntil: in30d,
    sentAt: null,
    acceptedAt: null,
    declinedReason: null,
    notes: null,
    createdAt: ago5d,
    updatedAt: ago5d,
    deliverables: [
      { id: 'd1', proposalId: 'p1', title: 'Weekly Strategy Sessions', description: '60-minute strategy calls every Monday', sortOrder: 0 },
      { id: 'd2', proposalId: 'p1', title: 'Monthly Performance Report', description: 'Comprehensive analysis of KPIs and recommendations', sortOrder: 1 },
      { id: 'd3', proposalId: 'p1', title: 'Quarterly Business Review Deck', description: 'Full QBR presentation and facilitation', sortOrder: 2 },
    ],
  },
  {
    id: 'p2',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    title: 'Globex Inc - Website Redesign',
    status: 'Sent',
    type: 'Project',
    executiveSummary: 'A complete redesign of the Globex corporate website to improve conversion rates and brand perception.',
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
  {
    id: 'p4',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    title: 'Globex - SEO Package',
    status: 'Sent',
    type: 'Retainer',
    executiveSummary: null,
    problemStatement: null,
    scopeOfWork: null,
    timeline: null,
    investment: 3000,
    paymentTerms: 'Monthly.',
    validUntil: ago5d,
    sentAt: ago20d,
    acceptedAt: null,
    declinedReason: null,
    notes: null,
    createdAt: ago60d,
    updatedAt: ago20d,
    deliverables: [],
  },
];

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = React.useState<Proposal[]>(INITIAL_PROPOSALS);
  const [formOpen, setFormOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [clientFilter, setClientFilter] = React.useState('');

  // Auto-expire check on mount
  React.useEffect(() => {
    const now = new Date();
    setProposals((prev) =>
      prev.map((p) => {
        if (
          p.status === 'Sent' &&
          p.validUntil &&
          new Date(p.validUntil) < now
        ) {
          return { ...p, status: 'Expired' as ProposalStatusLiteral };
        }
        return p;
      })
    );
  }, []);

  const handleCreate = (data: {
    title: string;
    clientId: string;
    type: string;
  }) => {
    const client = DEMO_CLIENTS.find((c) => c.id === data.clientId);
    const newProposal: Proposal = {
      id: generateId(),
      clientId: data.clientId,
      client,
      title: data.title,
      status: 'Draft',
      type: data.type,
      executiveSummary: null,
      problemStatement: null,
      scopeOfWork: null,
      timeline: null,
      investment: null,
      paymentTerms: null,
      validUntil: null,
      sentAt: null,
      acceptedAt: null,
      declinedReason: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deliverables: [],
    };
    setProposals((prev) => [newProposal, ...prev]);
    router.push(`/proposals/${newProposal.id}`);
  };

  const filtered = React.useMemo(() => {
    let result = [...proposals];
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (clientFilter) result = result.filter((p) => p.clientId === clientFilter);
    return result;
  }, [proposals, statusFilter, clientFilter]);

  const hasFilters = statusFilter || clientFilter;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
          <FileCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
          <p className="text-sm text-muted-foreground">
            Create, send, and track client proposals
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-32"
        >
          <option value="">All Status</option>
          {Object.values(ProposalStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Clients</option>
          {DEMO_CLIENTS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setClientFilter('');
            }}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} proposal{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="h-8 w-8" />}
          title="No proposals found"
          description={
            hasFilters
              ? 'Try adjusting your filters.'
              : 'Create your first proposal to get started.'
          }
          actionLabel="New Proposal"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Investment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Valid Until
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Sent
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="border-b border-border/50 bg-card/30 transition-colors hover:bg-card/60 cursor-pointer"
                  onClick={() => router.push(`/proposals/${proposal.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground text-sm">
                      {proposal.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {proposal.client?.name ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{proposal.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {proposal.investment != null
                      ? formatCurrency(proposal.investment)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {proposal.validUntil
                      ? formatDate(proposal.validUntil)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {proposal.sentAt ? formatDate(proposal.sentAt) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/proposals/${proposal.id}`);
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProposalForm
        clients={DEMO_CLIENTS}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
