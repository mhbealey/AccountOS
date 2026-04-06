import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [clients, openTaskCount, activities, snapshots] = await Promise.all([
      prisma.client.findMany({
        include: {
          scoreSnapshots: {
            orderBy: { capturedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.task.count({
        where: { status: { not: 'done' } },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { client: { select: { name: true } } },
      }),
      prisma.scoreSnapshot.findMany({
        orderBy: { capturedAt: 'asc' },
      }),
    ]);

    // clientCount
    const clientCount = clients.length;

    // avgScore: average of latest overallScore per client
    const latestScores = clients
      .map((c) => c.scoreSnapshots[0]?.overallScore)
      .filter((s): s is number => s != null);
    const avgScore =
      latestScores.length > 0
        ? Math.round(latestScores.reduce((a, b) => a + b, 0) / latestScores.length)
        : 0;

    // totalMrr
    const totalMrr = clients.reduce((sum, c) => sum + (c.mrr ?? 0), 0);

    // openTasks
    const openTasks = openTaskCount;

    // scoreHistory: last 12 months, all clients averaged by capturedAt month
    const trendMap = new Map<string, { total: number; count: number }>();
    for (const snap of snapshots) {
      const d = new Date(snap.capturedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = trendMap.get(key) ?? { total: 0, count: 0 };
      entry.total += snap.overallScore;
      entry.count += 1;
      trendMap.set(key, entry);
    }
    const scoreHistory = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, { total, count }]) => ({
        month,
        score: Math.round(total / count),
      }));

    // recentActivity: last 10 with client name
    const recentActivity = activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      details: a.details,
      clientName: a.client?.name ?? null,
      createdAt: a.createdAt,
    }));

    // clientScores: all clients with their latest score
    const clientScores = clients.map((c) => ({
      id: c.id,
      name: c.name,
      score: c.scoreSnapshots[0]?.overallScore ?? 0,
    }));

    return NextResponse.json({
      clientCount,
      avgScore,
      totalMrr,
      openTasks,
      scoreHistory,
      recentActivity,
      clientScores,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
