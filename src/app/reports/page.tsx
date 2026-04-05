'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RevenueReport } from '@/components/reports/RevenueReport';
import { PipelineReport } from '@/components/reports/PipelineReport';
import { ClientsReport } from '@/components/reports/ClientsReport';
import { UtilizationReport } from '@/components/reports/UtilizationReport';
import { CashFlowReport } from '@/components/reports/CashFlowReport';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Reports</h1>
            <p className="text-xs text-slate-500">
              Analytics and insights across your business
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="revenue">
          <TabsList className="flex-wrap">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <RevenueReport />
          </TabsContent>

          <TabsContent value="pipeline">
            <PipelineReport />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsReport />
          </TabsContent>

          <TabsContent value="utilization">
            <UtilizationReport />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
