import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CATEGORY_TO_FIELD: Record<string, string> = {
  risk_reduction: 'riskReduction',
  compliance: 'compliance',
  resilience: 'resilience',
  data_protection: 'dataProtection',
  incident_response: 'incidentResponse',
  security_culture: 'securityCulture',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { outcomes } = body;

    if (!outcomes || !Array.isArray(outcomes)) {
      return NextResponse.json(
        { error: 'outcomes array is required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Update each ValueOutcome record
    for (const outcome of outcomes) {
      await prisma.valueOutcome.updateMany({
        where: {
          clientId: id,
          category: outcome.category,
        },
        data: {
          score: outcome.score,
        },
      });
    }

    // Build snapshot data from the outcomes
    const snapshotData: Record<string, number> = {};
    let totalScore = 0;
    let count = 0;

    for (const outcome of outcomes) {
      const field = CATEGORY_TO_FIELD[outcome.category];
      if (field) {
        snapshotData[field] = outcome.score;
        totalScore += outcome.score;
        count++;
      }
    }

    const overallScore = count > 0 ? Math.round(totalScore / count) : 0;

    // Create score snapshot
    const snapshot = await prisma.scoreSnapshot.create({
      data: {
        clientId: id,
        overallScore,
        ...snapshotData,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        clientId: id,
        type: 'score_update',
        title: `Score updated to ${overallScore}`,
        details: `Updated ${outcomes.length} value outcomes`,
      },
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    console.error('POST /clients/[id]/scores error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
