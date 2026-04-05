import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deals = await prisma.deal.findMany({
      include: {
        stageHistory: { orderBy: { changedAt: 'asc' } },
      },
    });

    type DealWithHistory = (typeof deals)[number];

    const stageNames = ['Lead', 'Discovery', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost'];

    const stages = stageNames.map((stage) => {
      const stageDeals: DealWithHistory[] = deals.filter((d: DealWithHistory) => d.stage === stage);
      const totalValue = stageDeals.reduce((sum: number, d: DealWithHistory) => sum + d.value, 0);
      const weightedValue = stageDeals.reduce((sum: number, d: DealWithHistory) => sum + d.value * (d.probability / 100), 0);

      const daysInStage = stageDeals.map((d: DealWithHistory) => {
        const lastEntry = d.stageHistory.find((h: DealWithHistory['stageHistory'][number]) => h.toStage === stage);
        if (!lastEntry) return 0;
        const enteredAt = new Date(lastEntry.changedAt);
        const now = new Date();
        return Math.floor((now.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24));
      });

      const avgDaysInStage =
        daysInStage.length > 0
          ? Math.round(daysInStage.reduce((a: number, b: number) => a + b, 0) / daysInStage.length)
          : 0;

      return {
        stage,
        count: stageDeals.length,
        totalValue: Math.round(totalValue * 100) / 100,
        weightedValue: Math.round(weightedValue * 100) / 100,
        avgDaysInStage,
      };
    });

    const closedWon = deals.filter((d: DealWithHistory) => d.stage === 'ClosedWon').length;
    const closedLost = deals.filter((d: DealWithHistory) => d.stage === 'ClosedLost').length;
    const totalClosed = closedWon + closedLost;
    const winRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;

    const wonDeals: DealWithHistory[] = deals.filter((d: DealWithHistory) => d.stage === 'ClosedWon');
    const avgDealSize =
      wonDeals.length > 0
        ? Math.round((wonDeals.reduce((sum: number, d: DealWithHistory) => sum + d.value, 0) / wonDeals.length) * 100) / 100
        : 0;

    const cycleTimes = wonDeals
      .filter((d: DealWithHistory) => d.actualCloseDate)
      .map((d: DealWithHistory) => {
        const created = new Date(d.createdAt);
        const closed = new Date(d.actualCloseDate!);
        return Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgCycleTime =
      cycleTimes.length > 0
        ? Math.round(cycleTimes.reduce((a: number, b: number) => a + b, 0) / cycleTimes.length)
        : 0;

    return NextResponse.json({
      stages,
      winRate,
      avgDealSize,
      avgCycleTime,
    });
  } catch (error) {
    console.error('GET /api/reports/pipeline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
