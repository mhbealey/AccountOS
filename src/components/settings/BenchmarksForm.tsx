'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BarChart3, Save, Loader2 } from 'lucide-react';

interface BenchmarksData {
  targetMRR: number;
  targetUtilization: number;
  targetWinRate: number;
  maxClientConcentration: number;
}

export function BenchmarksForm() {
  const [form, setForm] = useState<BenchmarksData>({
    targetMRR: 50000,
    targetUtilization: 80,
    targetWinRate: 40,
    maxClientConcentration: 30,
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
        if (data.benchmarks) {
          setForm({
            targetMRR: data.benchmarks.targetMRR ?? 50000,
            targetUtilization: data.benchmarks.targetUtilization ?? 80,
            targetWinRate: data.benchmarks.targetWinRate ?? 40,
            maxClientConcentration: data.benchmarks.maxClientConcentration ?? 30,
          });
        }
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
        body: JSON.stringify({ benchmarks: form }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof BenchmarksData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));
    setSaved(false);
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          Benchmarks
        </CardTitle>
        <CardDescription>Comparison targets used in reports and dashboards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="targetMRR">Target MRR ($)</Label>
            <Input
              id="targetMRR"
              type="number"
              min={0}
              step={1000}
              value={form.targetMRR}
              onChange={update('targetMRR')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetUtilization">Target Utilization (%)</Label>
            <Input
              id="targetUtilization"
              type="number"
              min={0}
              max={100}
              step={5}
              value={form.targetUtilization}
              onChange={update('targetUtilization')}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="targetWinRate">Target Win Rate (%)</Label>
            <Input
              id="targetWinRate"
              type="number"
              min={0}
              max={100}
              step={5}
              value={form.targetWinRate}
              onChange={update('targetWinRate')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxConcentration">Max Client Concentration (%)</Label>
            <Input
              id="maxConcentration"
              type="number"
              min={0}
              max={100}
              step={5}
              value={form.maxClientConcentration}
              onChange={update('maxClientConcentration')}
            />
            <p className="text-xs text-slate-500">
              Warning triggered when any client exceeds this % of total revenue
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
