'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClientForm } from '@/components/clients/ClientForm';
import { HealthGauge } from '@/components/clients/HealthGauge';
import { NotesSection } from '@/components/clients/NotesSection';
import { ContactList } from '@/components/clients/ContactList';
import { GoalList } from '@/components/clients/GoalList';
import { ClientActivityTab } from '@/components/clients/ClientActivityTab';
import { ClientFinancialsTab } from '@/components/clients/ClientFinancialsTab';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Client } from '@/types';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  DollarSign,
  Briefcase,
  Globe,
  Users,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'Active': return 'success';
    case 'Onboarding': return 'info';
    case 'At-Risk': return 'warning';
    case 'Churned': return 'danger';
    case 'Paused': return 'warning';
    case 'Prospect': return 'default';
    default: return 'default';
  }
}

function getDealStageVariant(stage: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (stage) {
    case 'Lead': return 'default';
    case 'Discovery': return 'info';
    case 'Proposal': return 'info';
    case 'Negotiation': return 'warning';
    case 'ClosedWon': return 'success';
    case 'ClosedLost': return 'danger';
    default: return 'default';
  }
}

function getContractStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'Active': return 'success';
    case 'Draft': return 'default';
    case 'Sent': return 'info';
    case 'Expired': return 'warning';
    case 'Terminated': return 'danger';
    default: return 'default';
  }
}

function getProposalStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'Draft': return 'default';
    case 'Sent': return 'info';
    case 'Accepted': return 'success';
    case 'Declined': return 'danger';
    case 'Expired': return 'warning';
    default: return 'default';
  }
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [csmPulse, setCsmPulse] = useState(50);
  const [savingPulse, setSavingPulse] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        setCsmPulse(data.csmPulse ?? 50);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleUpdate = async (data: Partial<Client>) => {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    await fetchClient();
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      router.push('/clients');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleNotesUpdate = async (updatedNotes: string) => {
    await handleUpdate({ notes: updatedNotes } as Partial<Client>);
  };

  const handleCsmPulseChange = async (value: number) => {
    setCsmPulse(value);
    setSavingPulse(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csmPulse: value }),
      });
      await fetchClient();
    } finally {
      setSavingPulse(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground mb-2">Client Not Found</h2>
        <p className="text-muted-foreground mb-4">The client you are looking for does not exist.</p>
        <Link href="/clients">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <Badge variant={getStatusBadgeVariant(client.status)}>
                {client.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {client.industry && <span>{client.industry}</span>}
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  Website
                </a>
              )}
            </div>
          </div>
          <HealthGauge score={client.healthScore} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview">
          <div className="space-y-6 mt-4">
            {/* Key info cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border bg-[#12122a] p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">MRR</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(client.mrr)}</p>
              </Card>
              <Card className="border-border bg-[#12122a] p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">TCV</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(client.contractValue)}</p>
              </Card>
              <Card className="border-border bg-[#12122a] p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Source</span>
                </div>
                <p className="text-lg font-semibold text-white">{client.source ?? '-'}</p>
              </Card>
              <Card className="border-border bg-[#12122a] p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Company Size</span>
                </div>
                <p className="text-lg font-semibold text-white">{client.companySize ?? '-'}</p>
              </Card>
            </div>

            {/* Key dates */}
            <Card className="border-border bg-[#12122a]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Onboarded</p>
                    <p className="text-foreground font-medium">
                      {client.onboardedAt ? formatDate(client.onboardedAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">First Value</p>
                    <p className="text-foreground font-medium">
                      {client.firstValueAt ? formatDate(client.firstValueAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Contact</p>
                    <p className="text-foreground font-medium">
                      {client.lastContactAt ? formatDate(client.lastContactAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next QBR</p>
                    <p className="text-foreground font-medium">
                      {client.nextQbrDate ? formatDate(client.nextQbrDate) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Score Breakdown */}
            <Card className="border-border bg-[#12122a]">
              <CardHeader>
                <CardTitle className="text-sm">Health Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-8">
                  <HealthGauge score={client.healthScore} size="lg" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Engagement</span>
                        <span className="text-foreground">{client.engagementScore}</span>
                      </div>
                      <Progress value={client.engagementScore} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Satisfaction</span>
                        <span className="text-foreground">{client.satisfactionScore ?? '-'}</span>
                      </div>
                      <Progress value={client.satisfactionScore ?? 0} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="text-foreground">{client.paymentScore}</span>
                      </div>
                      <Progress value={client.paymentScore} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Adoption</span>
                        <span className="text-foreground">{client.adoptionScore ?? '-'}</span>
                      </div>
                      <Progress value={client.adoptionScore ?? 0} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">CSM Pulse</span>
                        <span className="text-foreground">
                          {csmPulse}
                          {savingPulse && <span className="text-xs text-muted-foreground ml-1">saving...</span>}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={csmPulse}
                        onChange={(e) => setCsmPulse(parseInt(e.target.value))}
                        onMouseUp={() => handleCsmPulseChange(csmPulse)}
                        onTouchEnd={() => handleCsmPulseChange(csmPulse)}
                        className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-border bg-[#12122a]">
              <CardContent className="pt-6">
                <NotesSection
                  notes={client.notes}
                  onAppendNote={handleNotesUpdate}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Contacts Tab ── */}
        <TabsContent value="contacts">
          <div className="mt-4">
            <ContactList
              contacts={client.contacts ?? []}
              clientId={clientId}
              onRefresh={fetchClient}
            />
          </div>
        </TabsContent>

        {/* ── Goals Tab ── */}
        <TabsContent value="goals">
          <div className="mt-4">
            <GoalList
              goals={client.goals ?? []}
              clientId={clientId}
              onRefresh={fetchClient}
            />
          </div>
        </TabsContent>

        {/* ── Activity Tab ── */}
        <TabsContent value="activity">
          <div className="mt-4">
            <ClientActivityTab
              activities={client.activities ?? []}
              clientId={clientId}
              onRefresh={fetchClient}
            />
          </div>
        </TabsContent>

        {/* ── Financials Tab ── */}
        <TabsContent value="financials">
          <div className="mt-4">
            <ClientFinancialsTab
              timeEntries={client.timeEntries ?? []}
              invoices={client.invoices ?? []}
            />
          </div>
        </TabsContent>

        {/* ── Deals Tab ── */}
        <TabsContent value="deals">
          <div className="mt-4">
            {!client.deals || client.deals.length === 0 ? (
              <Card className="border-border bg-[#12122a]">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Briefcase className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No deals</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                      Deals associated with this client will appear here.
                    </p>
                    <Link href="/pipeline" className="mt-4">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Go to Pipeline
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {client.deals.map((deal) => (
                  <Card key={deal.id} className="border-border bg-[#12122a] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{deal.title}</span>
                          <Badge variant={getDealStageVariant(deal.stage)}>
                            {deal.stage}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="text-foreground font-semibold">
                            {formatCurrency(deal.value)}
                          </span>
                          <span>Probability: {deal.probability}%</span>
                          {deal.closeDate && (
                            <span>Close: {formatDate(deal.closeDate)}</span>
                          )}
                        </div>
                        {deal.nextStep && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Next step: {deal.nextStep}
                          </p>
                        )}
                      </div>
                      <Link href="/pipeline">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Documents Tab ── */}
        <TabsContent value="documents">
          <div className="mt-4 space-y-6">
            {/* Contracts */}
            <Card className="border-border bg-[#12122a]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contracts
                  </CardTitle>
                  <Link href={`/contracts?clientId=${clientId}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      New Contract
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!client.contracts || client.contracts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No contracts linked to this client.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Title</th>
                          <th className="pb-2 pr-4">Type</th>
                          <th className="pb-2 pr-4">Status</th>
                          <th className="pb-2 pr-4">Start</th>
                          <th className="pb-2 pr-4">End</th>
                          <th className="pb-2 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.contracts.map((contract) => (
                          <tr key={contract.id} className="border-b border-border/50">
                            <td className="py-2 pr-4 text-foreground font-medium">
                              {contract.title}
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {contract.type}
                            </td>
                            <td className="py-2 pr-4">
                              <Badge variant={getContractStatusVariant(contract.status)}>
                                {contract.status}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {contract.startDate ? formatDate(contract.startDate) : '-'}
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {contract.endDate ? formatDate(contract.endDate) : '-'}
                            </td>
                            <td className="py-2 text-right text-foreground">
                              {contract.value != null ? formatCurrency(contract.value) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposals */}
            <Card className="border-border bg-[#12122a]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Proposals
                  </CardTitle>
                  <Link href={`/proposals?clientId=${clientId}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      New Proposal
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!client.proposals || client.proposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No proposals linked to this client.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Title</th>
                          <th className="pb-2 pr-4">Status</th>
                          <th className="pb-2 pr-4">Investment</th>
                          <th className="pb-2 pr-4">Sent</th>
                          <th className="pb-2">Valid Until</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.proposals.map((proposal) => (
                          <tr key={proposal.id} className="border-b border-border/50">
                            <td className="py-2 pr-4 text-foreground font-medium">
                              {proposal.title}
                            </td>
                            <td className="py-2 pr-4">
                              <Badge variant={getProposalStatusVariant(proposal.status)}>
                                {proposal.status}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4 text-foreground">
                              {proposal.investment != null ? formatCurrency(proposal.investment) : '-'}
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {proposal.sentAt ? formatDate(proposal.sentAt) : '-'}
                            </td>
                            <td className="py-2 text-muted-foreground">
                              {proposal.validUntil ? formatDate(proposal.validUntil) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <ClientForm
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSubmit={handleUpdate}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{client.name}</strong>?
              This will permanently remove the client and all associated data including
              contacts, deals, activities, invoices, time entries, contracts, and proposals.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
