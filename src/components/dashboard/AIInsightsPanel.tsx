'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  UserX,
  CalendarClock,
  Sparkles,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface StaleClient {
  id: string;
  name: string;
  daysSinceContact: number;
}

interface UpcomingRenewal {
  id: string;
  clientName: string;
  clientId: string;
  expiresAt: string;
  daysUntil: number;
}

interface AIInsightsPanelProps {
  staleClients: StaleClient[];
  upcomingRenewals: UpcomingRenewal[];
  onGenerateDigest: () => Promise<void>;
}

export function AIInsightsPanel({
  staleClients,
  upcomingRenewals,
  onGenerateDigest,
}: AIInsightsPanelProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateDigest();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Brain className="h-4 w-4" />
            </div>
            <CardTitle className="text-base text-white">AI Insights</CardTitle>
          </div>
          <Badge variant="info" className="text-[10px]">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stale clients */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <UserX className="h-4 w-4 text-amber-400" />
            <h4 className="text-sm font-medium text-slate-300">
              No contact in 14+ days
            </h4>
            {staleClients.length > 0 && (
              <Badge variant="warning" className="ml-auto text-[10px]">
                {staleClients.length}
              </Badge>
            )}
          </div>
          {staleClients.length === 0 ? (
            <p className="pl-6 text-xs text-slate-500">
              All clients contacted recently.
            </p>
          ) : (
            <ul className="space-y-1 pl-6">
              {staleClients.slice(0, 5).map((client) => (
                <li key={client.id}>
                  <Link
                    href={`/clients/${client.id}`}
                    className="group flex items-center justify-between rounded px-2 py-1 text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="truncate text-slate-300 group-hover:text-white">
                      {client.name}
                    </span>
                    <span className="flex-shrink-0 text-xs text-amber-500">
                      {client.daysSinceContact}d ago
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming renewals */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-slate-300">
              Upcoming renewals
            </h4>
            {upcomingRenewals.length > 0 && (
              <Badge variant="info" className="ml-auto text-[10px]">
                {upcomingRenewals.length}
              </Badge>
            )}
          </div>
          {upcomingRenewals.length === 0 ? (
            <p className="pl-6 text-xs text-slate-500">
              No renewals upcoming.
            </p>
          ) : (
            <ul className="space-y-1 pl-6">
              {upcomingRenewals.slice(0, 5).map((renewal) => (
                <li key={renewal.id}>
                  <Link
                    href={`/clients/${renewal.clientId}`}
                    className="group flex items-center justify-between rounded px-2 py-1 text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="truncate text-slate-300 group-hover:text-white">
                      {renewal.clientName}
                    </span>
                    <span className="flex-shrink-0 text-xs text-blue-400">
                      {renewal.daysUntil}d left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Generate digest */}
        <div className="border-t border-[#1e1e3a] pt-4">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-300 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-200"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating digest...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate weekly digest
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
