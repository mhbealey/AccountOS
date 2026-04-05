'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportButton } from './ExportButton';
import { formatCurrency } from '@/lib/utils';

interface HealthBucket {
  bucket: string;
  count: number;
  color: string;
}

interface ClientStatus {
  status: string;
  count: number;
}

interface EngagementDecay {
  clientId: string;
  clientName: string;
  daysSinceContact: number;
  lastContactedAt: string;
}

interface ChurnedClient {
  clientId: string;
  clientName: string;
  churnDate: string;
  reason: string;
}

interface LeadSourceROI {
  source: string;
  clients: number;
  totalRevenue: number;
  avgRevenuePerClient: number;
}

interface ClientsData {
  healthDistribution: HealthBucket[];
  statusBreakdown: ClientStatus[];
  engagementDecay: EngagementDecay[];
  churnedClients: ChurnedClient[];
  leadSourceROI: LeadSourceROI[];
}

const HEALTH_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  'At-Risk': '#eab308',
  Healthy: '#22c55e',
  Thriving: '#3b82f6',
};

const STATUS_COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316', '#64748b'];

export function ClientsReport() {
  const [data, setData] = useState<ClientsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports/clients');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data ?? json);
      } catch {
        setData({
          healthDistribution: [],
          statusBreakdown: [],
          engagementDecay: [],
          churnedClients: [],
          leadSourceROI: [],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-80 rounded-xl bg-[#1e1e3a]" />
        <Skeleton className="h-80 rounded-xl bg-[#1e1e3a]" />
      </div>
    );
  }

  if (!data) return null;

  const engagementExport = data.engagementDecay.map((e) => ({
    client: e.clientName,
    days_since_contact: e.daysSinceContact,
    last_contacted: e.lastContactedAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">Client Analytics</h3>
        <ExportButton data={engagementExport} filename="client-engagement-report" />
      </div>

      {/* Health distribution + status pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Health Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.healthDistribution.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No health data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.healthDistribution} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#1e1e3a' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#1e1e3a' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: unknown) => [value as number, 'Clients']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={48}>
                    {data.healthDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={HEALTH_COLORS[entry.bucket] ?? '#6366f1'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Clients by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.statusBreakdown.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No status data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    strokeWidth={0}
                    label={(props: Record<string, unknown>) => `${props.status}: ${props.count}`}
                    labelLine={{ stroke: '#475569' }}
                  >
                    {data.statusBreakdown.map((_, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement decay table */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Engagement Decay Report</CardTitle>
          <p className="text-xs text-slate-500">Clients sorted by days since last contact</p>
        </CardHeader>
        <CardContent>
          {data.engagementDecay.length === 0 ? (
            <p className="text-sm text-slate-500">All clients have been recently contacted</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e3a]">
                    <th className="pb-2 text-left font-medium text-slate-400">Client</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Days Since Contact</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Last Contact</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.engagementDecay.map((client) => (
                    <tr key={client.clientId} className="border-b border-[#1e1e3a]/50">
                      <td className="py-2.5 text-slate-300">{client.clientName}</td>
                      <td className={`py-2.5 text-right font-medium ${client.daysSinceContact > 14 ? 'text-red-400' : 'text-white'}`}>
                        {client.daysSinceContact}
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        {new Date(client.lastContactedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-right">
                        {client.daysSinceContact > 14 ? (
                          <Badge variant="danger">Stale</Badge>
                        ) : client.daysSinceContact > 7 ? (
                          <Badge variant="warning">Fading</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Churn analysis */}
      {data.churnedClients.length > 0 && (
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Churn Analysis</CardTitle>
            <p className="text-xs text-slate-500">Churned clients with reasons</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e3a]">
                    <th className="pb-2 text-left font-medium text-slate-400">Client</th>
                    <th className="pb-2 text-left font-medium text-slate-400">Churn Date</th>
                    <th className="pb-2 text-left font-medium text-slate-400">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {data.churnedClients.map((client) => (
                    <tr key={client.clientId} className="border-b border-[#1e1e3a]/50">
                      <td className="py-2.5 text-slate-300">{client.clientName}</td>
                      <td className="py-2.5 text-slate-400">
                        {new Date(client.churnDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-slate-300">{client.reason || 'Not specified'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead source ROI */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Lead Source ROI</CardTitle>
        </CardHeader>
        <CardContent>
          {data.leadSourceROI.length === 0 ? (
            <p className="text-sm text-slate-500">No lead source data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e3a]">
                    <th className="pb-2 text-left font-medium text-slate-400">Source</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Clients</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Total Revenue</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Avg Rev/Client</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leadSourceROI.map((source, idx) => (
                    <tr key={idx} className="border-b border-[#1e1e3a]/50">
                      <td className="py-2.5 text-slate-300">{source.source}</td>
                      <td className="py-2.5 text-right text-white">{source.clients}</td>
                      <td className="py-2.5 text-right text-white">{formatCurrency(source.totalRevenue)}</td>
                      <td className="py-2.5 text-right text-white">{formatCurrency(source.avgRevenuePerClient)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
