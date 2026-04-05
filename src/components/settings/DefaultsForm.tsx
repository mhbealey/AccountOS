'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Save, Loader2 } from 'lucide-react';

interface DefaultsData {
  defaultHourlyRate: number;
  defaultPaymentTerms: string;
  invoicePrefix: string;
  invoiceCounter: number;
}

export function DefaultsForm() {
  const [form, setForm] = useState<DefaultsData>({
    defaultHourlyRate: 150,
    defaultPaymentTerms: 'Net 30',
    invoicePrefix: 'INV',
    invoiceCounter: 1,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data ?? json;
        setForm({
          defaultHourlyRate: data.defaultHourlyRate ?? 150,
          defaultPaymentTerms: data.defaultPaymentTerms ?? 'Net 30',
          invoicePrefix: data.invoicePrefix ?? 'INV',
          invoiceCounter: data.invoiceCounter ?? 1,
        });
      } catch {
        // keep defaults
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultHourlyRate: form.defaultHourlyRate,
          defaultPaymentTerms: form.defaultPaymentTerms,
          invoicePrefix: form.invoicePrefix,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-indigo-400" />
          Defaults
        </CardTitle>
        <CardDescription>Default values for new invoices and clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Default Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min={0}
              step={5}
              value={form.defaultHourlyRate}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, defaultHourlyRate: Number(e.target.value) }));
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Default Payment Terms</Label>
            <Select
              id="paymentTerms"
              value={form.defaultPaymentTerms}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, defaultPaymentTerms: e.target.value }));
                setSaved(false);
              }}
            >
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
            <Input
              id="invoicePrefix"
              value={form.invoicePrefix}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, invoicePrefix: e.target.value }));
                setSaved(false);
              }}
              placeholder="INV"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceCounter">Invoice Counter</Label>
            <Input
              id="invoiceCounter"
              type="number"
              value={form.invoiceCounter}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-slate-500">
              Auto-incremented. Next invoice: {form.invoicePrefix}-{String(form.invoiceCounter).padStart(4, '0')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saved && <span className="text-sm text-emerald-400">Saved successfully</span>}
        </div>
      </CardContent>
    </Card>
  );
}
