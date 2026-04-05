'use client';

import * as React from 'react';
import { FileSignature, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContractList } from '@/components/contracts/ContractList';
import { ContractForm } from '@/components/contracts/ContractForm';
import { type Contract, type Client } from '@/types';

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
const in15d = new Date(now.getTime() + 15 * 86400000);
const in45d = new Date(now.getTime() + 45 * 86400000);
const in90d = new Date(now.getTime() + 90 * 86400000);
const ago30d = new Date(now.getTime() - 30 * 86400000);
const ago365d = new Date(now.getTime() - 365 * 86400000);
const ago180d = new Date(now.getTime() - 180 * 86400000);

const DEMO_CONTRACTS: Contract[] = [
  {
    id: 'ct1',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    title: 'Acme Corp - Annual Retainer',
    type: 'Retainer',
    status: 'Active',
    startDate: ago365d,
    endDate: in15d,
    value: 60000,
    monthlyValue: 5000,
    renewalType: 'Manual',
    renewalTerms: '12-month renewal at adjusted rate',
    reminderDays: 30,
    autoRenewDate: null,
    terminationClause: '30 days written notice required',
    fileUrl: null,
    notes: 'Primary retainer agreement. Renewing at new rate pending Q2 review.',
    createdAt: ago365d,
    updatedAt: now,
  },
  {
    id: 'ct2',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    title: 'Globex - Master Service Agreement',
    type: 'MSA',
    status: 'Active',
    startDate: ago180d,
    endDate: in90d,
    value: 96000,
    monthlyValue: 8000,
    renewalType: 'Auto',
    renewalTerms: 'Auto-renews for 12 months unless cancelled 60 days prior',
    reminderDays: 60,
    autoRenewDate: in90d,
    terminationClause: '60 days written notice. Early termination fee of 2 months.',
    fileUrl: 'https://example.com/contracts/globex-msa.pdf',
    notes: null,
    createdAt: ago180d,
    updatedAt: now,
  },
  {
    id: 'ct3',
    clientId: 'c1',
    client: DEMO_CLIENTS[0],
    title: 'Acme Corp - NDA',
    type: 'NDA',
    status: 'Active',
    startDate: ago365d,
    endDate: in45d,
    value: null,
    monthlyValue: null,
    renewalType: 'None',
    renewalTerms: null,
    reminderDays: 30,
    autoRenewDate: null,
    terminationClause: null,
    fileUrl: null,
    notes: 'Mutual NDA covering all project work.',
    createdAt: ago365d,
    updatedAt: ago365d,
  },
  {
    id: 'ct4',
    clientId: 'c2',
    client: DEMO_CLIENTS[1],
    title: 'Globex - Q1 SOW',
    type: 'SOW',
    status: 'Expired',
    startDate: ago180d,
    endDate: ago30d,
    value: 25000,
    monthlyValue: null,
    renewalType: 'None',
    renewalTerms: null,
    reminderDays: 14,
    autoRenewDate: null,
    terminationClause: null,
    fileUrl: null,
    notes: 'Completed. Deliverables approved.',
    createdAt: ago180d,
    updatedAt: ago30d,
  },
  {
    id: 'ct5',
    clientId: 'c3',
    client: DEMO_CLIENTS[2],
    title: 'Initech - Proposal Retainer Draft',
    type: 'Retainer',
    status: 'Draft',
    startDate: null,
    endDate: null,
    value: 36000,
    monthlyValue: 3000,
    renewalType: 'Manual',
    renewalTerms: null,
    reminderDays: 30,
    autoRenewDate: null,
    terminationClause: null,
    fileUrl: null,
    notes: 'Pending prospect conversion.',
    createdAt: now,
    updatedAt: now,
  },
];

export default function ContractsPage() {
  const [contracts, setContracts] = React.useState<Contract[]>(DEMO_CONTRACTS);
  const [editContract, setEditContract] = React.useState<Contract | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);

  const handleNew = () => {
    setEditContract(null);
    setFormOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setEditContract(contract);
    setFormOpen(true);
  };

  const handleSave = (contract: Contract) => {
    setContracts((prev) => {
      const idx = prev.findIndex((c) => c.id === contract.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = contract;
        return updated;
      }
      return [...prev, contract];
    });
    setEditContract(null);
  };

  const handleDelete = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
          <FileSignature className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
          <p className="text-sm text-muted-foreground">
            Manage agreements, track renewals, and stay on top of expirations
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Contract
          </Button>
        </div>
      </div>

      <ContractList
        contracts={contracts}
        clients={DEMO_CLIENTS}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ContractForm
        contract={editContract}
        clients={DEMO_CLIENTS}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditContract(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
