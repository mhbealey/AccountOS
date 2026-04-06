import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        scoreSnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
    });

    const result = clients.map(({ scoreSnapshots, ...client }) => ({
      ...client,
      currentScore: scoreSnapshots[0]?.overallScore ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const VALUE_OUTCOME_CATEGORIES = [
  'risk_reduction',
  'compliance',
  'resilience',
  'data_protection',
  'incident_response',
  'security_culture',
] as const;

const JOURNEY_PHASES = [
  'CRA',
  'Remediation',
  'Implementation',
  'Monitoring',
  'Optimization',
  'Maturity',
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name: body.name,
        industry: body.industry ?? null,
        size: body.size ?? null,
        status: body.status ?? 'active',
        tier: body.tier ?? null,
        contactName: body.contactName ?? null,
        contactEmail: body.contactEmail ?? null,
        contactPhone: body.contactPhone ?? null,
        logo: body.logo ?? null,
        notes: body.notes ?? null,
        mrr: body.mrr ?? 0,
        contractEnd: body.contractEnd ? new Date(body.contractEnd) : null,
        valueOutcomes: {
          create: VALUE_OUTCOME_CATEGORIES.map((category) => ({
            category,
            score: 0,
          })),
        },
        journeyPhases: {
          create: JOURNEY_PHASES.map((phase, index) => ({
            phase,
            status: 'not_started',
            order: index,
          })),
        },
      },
      include: {
        valueOutcomes: true,
        journeyPhases: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('POST /clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
