'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { HeartPulse, Save, Loader2, HelpCircle } from 'lucide-react';

interface WeightsData {
  engagement: number;
  satisfaction: number;
  payment: number;
  adoption: number;
  csmPulse: number;
}

const WEIGHT_DESCRIPTIONS: Record<keyof WeightsData, string> = {
  engagement: 'Measures frequency and quality of client interactions, meetings, and response times',
  satisfaction: 'Client satisfaction survey scores, NPS, and qualitative feedback',
  payment: 'Payment timeliness, invoice aging, and billing relationship health',
  adoption: 'Product/service usage depth, feature adoption, and value realization',
  csmPulse: 'CSM subjective assessment of relationship strength and expansion potential',
};

const WEIGHT_LABELS: Record<keyof WeightsData, string> = {
  engagement: 'Engagement',
  satisfaction: 'Satisfaction',
  payment: 'Payment',
  adoption: 'Adoption',
  csmPulse: 'CSM Pulse',
};

export function HealthWeightsForm() {
  const [weights, setWeights] = useState<WeightsData>({
    engagement: 25,
    satisfaction: 25,
    payment: 20,
    adoption: 15,
    csmPulse: 15,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = weights.engagement + weights.satisfaction + weights.payment + weights.adoption + weights.csmPulse;
  const isValid = total === 100;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data ?? json;
        if (data.healthWeights) {
          setWeights({
            engagement: data.healthWeights.engagement ?? 25,
            satisfaction: data.healthWeights.satisfaction ?? 25,
            payment: data.healthWeights.payment ?? 20,
            adoption: data.healthWeights.adoption ?? 15,
            csmPulse: data.healthWeights.csmPulse ?? 15,
          });
        }
      } catch {
        // keep defaults
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ healthWeights: weights }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  const updateWeight = (key: keyof WeightsData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }));
    setSaved(false);
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <HeartPulse className="h-5 w-5 text-indigo-400" />
          Health Score Weights
        </CardTitle>
        <CardDescription>Configure how each factor contributes to client health scores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {(Object.keys(WEIGHT_LABELS) as (keyof WeightsData)[]).map((key) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`weight-${key}`}>{WEIGHT_LABELS[key]}</Label>
              <Tooltip content={WEIGHT_DESCRIPTIONS[key]} side="right">
                <button type="button" className="text-slate-500 hover:text-slate-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <span className="ml-auto text-sm font-medium text-white">{weights[key]}%</span>
            </div>
            <input
              id={`weight-${key}`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights[key]}
              onChange={updateWeight(key)}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1e1e3a] accent-indigo-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
            />
          </div>
        ))}

        <div className="flex items-center gap-3 rounded-lg border border-[#1e1e3a] bg-[#0a0a1a] px-4 py-3">
          <span className="text-sm text-slate-400">Total:</span>
          <span
            className={`text-lg font-bold ${
              isValid ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {total}%
          </span>
          {!isValid && (
            <span className="text-sm text-red-400">
              {total < 100 ? `${100 - total}% remaining` : `${total - 100}% over limit`}
            </span>
          )}
          {isValid && <span className="text-sm text-emerald-400">Valid</span>}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || !isValid}>
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
