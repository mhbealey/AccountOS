'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Client, ClientStatusLiteral } from '@/types';

const STATUS_OPTIONS: ClientStatusLiteral[] = [
  'Prospect',
  'Onboarding',
  'Active',
  'At-Risk',
  'Paused',
  'Churned',
];

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media',
  'Real Estate',
  'Other',
];

const SOURCE_OPTIONS = [
  'Referral',
  'Website',
  'LinkedIn',
  'Conference',
  'Cold Outreach',
  'Inbound',
  'Partner',
  'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSubmit: (data: Partial<Client>) => Promise<void>;
}

export function ClientForm({ open, onOpenChange, client, onSubmit }: ClientFormProps) {
  const isEdit = !!client;

  const [form, setForm] = useState({
    name: '',
    status: 'Prospect' as ClientStatusLiteral,
    industry: '',
    website: '',
    companySize: '',
    source: '',
    mrr: 0,
    contractValue: 0,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        status: client.status,
        industry: client.industry ?? '',
        website: client.website ?? '',
        companySize: client.companySize ?? '',
        source: client.source ?? '',
        mrr: client.mrr,
        contractValue: client.contractValue,
        notes: client.notes ?? '',
      });
    } else {
      setForm({
        name: '',
        status: 'Prospect',
        industry: '',
        website: '',
        companySize: '',
        source: '',
        mrr: 0,
        contractValue: 0,
        notes: '',
      });
    }
    setErrors({});
  }, [client, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Client name is required';
    if (form.mrr < 0) errs.mrr = 'MRR cannot be negative';
    if (form.contractValue < 0) errs.contractValue = 'Contract value cannot be negative';
    if (form.website && !/^https?:\/\/.+/.test(form.website) && form.website.trim()) {
      errs.website = 'Website must start with http:// or https://';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        status: form.status,
        industry: form.industry || null,
        website: form.website || null,
        companySize: form.companySize || null,
        source: form.source || null,
        mrr: form.mrr,
        contractValue: form.contractValue,
        notes: form.notes || null,
      });
      onOpenChange(false);
    } catch {
      setErrors({ _form: 'Failed to save client. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors._form && (
            <p className="text-sm text-red-400">{errors._form}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cf-name">Name *</Label>
            <Input
              id="cf-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Corp"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cf-status">Status</Label>
              <Select
                id="cf-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatusLiteral })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-industry">Industry</Label>
              <Select
                id="cf-industry"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              >
                <option value="">Select...</option>
                {INDUSTRY_OPTIONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cf-source">Source</Label>
              <Select
                id="cf-source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="">Select...</option>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-size">Company Size</Label>
              <Select
                id="cf-size"
                value={form.companySize}
                onChange={(e) => setForm({ ...form, companySize: e.target.value })}
              >
                <option value="">Select...</option>
                {COMPANY_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-website">Website</Label>
            <Input
              id="cf-website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://example.com"
            />
            {errors.website && <p className="text-xs text-red-400">{errors.website}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cf-mrr">MRR ($)</Label>
              <Input
                id="cf-mrr"
                type="number"
                min={0}
                value={form.mrr}
                onChange={(e) => setForm({ ...form, mrr: parseFloat(e.target.value) || 0 })}
              />
              {errors.mrr && <p className="text-xs text-red-400">{errors.mrr}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-tcv">Contract Value ($)</Label>
              <Input
                id="cf-tcv"
                type="number"
                min={0}
                value={form.contractValue}
                onChange={(e) => setForm({ ...form, contractValue: parseFloat(e.target.value) || 0 })}
              />
              {errors.contractValue && <p className="text-xs text-red-400">{errors.contractValue}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-notes">Notes</Label>
            <Textarea
              id="cf-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any relevant notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
