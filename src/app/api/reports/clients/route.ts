import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        healthScore: true,
        lastContactAt: true,
        churnedAt: true,
        churnReason: true,
        createdAt: true,
      },
    });

    type ClientRow = (typeof clients)[number];

    // Health distribution
    const healthDistribution = {
      critical: clients.filter((c: ClientRow) => c.healthScore <= 30).length,
      atRisk: clients.filter((c: ClientRow) => c.healthScore > 30 && c.healthScore <= 60).length,
      healthy: clients.filter((c: ClientRow) => c.healthScore > 60 && c.healthScore <= 80).length,
      thriving: clients.filter((c: ClientRow) => c.healthScore > 80).length,
    };

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const c of clients) {
      statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
    }

    // Engagement decay
    const now = new Date();
    const engagementDecay = clients
      .filter((c: ClientRow) => c.status !== 'Churned' && c.lastContactAt)
      .map((c: ClientRow) => {
        const daysSinceContact = Math.floor(
          (now.getTime() - new Date(c.lastContactAt!).getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          clientId: c.id,
          clientName: c.name,
          daysSinceContact,
        };
      })
      .sort((a: { daysSinceContact: number }, b: { daysSinceContact: number }) => b.daysSinceContact - a.daysSinceContact);

    // Churn analysis
    const churnedClients: ClientRow[] = clients.filter((c: ClientRow) => c.status === 'Churned');
    const churnReasons: Record<string, number> = {};
    for (const c of churnedClients) {
      const reason = c.churnReason || 'Unknown';
      churnReasons[reason] = (churnReasons[reason] || 0) + 1;
    }

    const churnTimes = churnedClients
      .filter((c: ClientRow) => c.churnedAt)
      .map((c: ClientRow) => {
        const created = new Date(c.createdAt);
        const churned = new Date(c.churnedAt!);
        return Math.floor((churned.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgTimeToChurn =
      churnTimes.length > 0
        ? Math.round(churnTimes.reduce((a: number, b: number) => a + b, 0) / churnTimes.length)
        : 0;

    const churnAnalysis = {
      totalChurned: churnedClients.length,
      reasons: churnReasons,
      avgTimeToChurnDays: avgTimeToChurn,
    };

    return NextResponse.json({
      healthDistribution,
      statusBreakdown,
      engagementDecay,
      churnAnalysis,
    });
  } catch (error) {
    console.error('GET /api/reports/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
