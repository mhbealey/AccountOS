'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BusinessInfoForm } from '@/components/settings/BusinessInfoForm';
import { DefaultsForm } from '@/components/settings/DefaultsForm';
import { GoalsForm } from '@/components/settings/GoalsForm';
import { HealthWeightsForm } from '@/components/settings/HealthWeightsForm';
import { BenchmarksForm } from '@/components/settings/BenchmarksForm';
import { AIConfigForm } from '@/components/settings/AIConfigForm';
import { DataManagement } from '@/components/settings/DataManagement';
import { DangerZone } from '@/components/settings/DangerZone';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-xs text-slate-500">
              Configure your account, defaults, and integrations
            </p>
          </div>
        </div>

        {/* Business Info */}
        <BusinessInfoForm />

        {/* Defaults */}
        <DefaultsForm />

        {/* Goals */}
        <GoalsForm />

        <Separator className="bg-[#1e1e3a]" />

        {/* Health Score Weights */}
        <HealthWeightsForm />

        {/* Benchmarks */}
        <BenchmarksForm />

        <Separator className="bg-[#1e1e3a]" />

        {/* AI Configuration */}
        <AIConfigForm />

        <Separator className="bg-[#1e1e3a]" />

        {/* Data Management */}
        <DataManagement />

        {/* Danger Zone */}
        <DangerZone />
      </div>
    </div>
  );
}
