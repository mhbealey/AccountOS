'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Target, Save, Loader2 } from 'lucide-react';

interface GoalsData {
  annualRevenueTarget: number;
  monthlyBillableHoursTarget: number;
}

export function GoalsForm() {
  const [form, setForm] = useState<GoalsData>({
    annualRevenueTarget: 500000,
    monthlyBillableHoursTarget: 160,
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
          annualRevenueTarget: data.annualRevenueTarget ?? 500000,
          monthlyBillableHoursTarget: data.monthlyBillableHoursTarget ?? 160,
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
        body: JSON.stringify(form),
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
          <Target className="h-5 w-5 text-indigo-400" />
          Goals
        </CardTitle>
        <CardDescription>Revenue and utilization targets used in reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualRevenue">Annual Revenue Target ($)</Label>
            <Input
              id="annualRevenue"
              type="number"
              min={0}
              step={10000}
              value={form.annualRevenueTarget}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, annualRevenueTarget: Number(e.target.value) }));
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyHours">Monthly Billable Hours Target</Label>
            <Input
              id="monthlyHours"
              type="number"
              min={0}
              step={5}
              value={form.monthlyBillableHoursTarget}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  monthlyBillableHoursTarget: Number(e.target.value),
                }));
                setSaved(false);
              }}
            />
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
