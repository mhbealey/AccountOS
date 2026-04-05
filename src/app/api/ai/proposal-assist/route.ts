import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateAIResponse } from '@/lib/ai';
import { PROMPTS } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    if (!body.description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      include: {
        deals: {
          where: { stage: { notIn: ['ClosedLost'] } },
          take: 10,
        },
        goals: {
          where: { status: { not: 'Achieved' } },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const context = JSON.stringify({
      clientName: client.name,
      clientStatus: client.status,
      industry: client.industry,
      description: body.description,
      existingDeals: client.deals.map((d: typeof client.deals[number]) => ({
        title: d.title,
        value: d.value,
        stage: d.stage,
      })),
      goals: client.goals.map((g: typeof client.goals[number]) => ({
        title: g.title,
        description: g.description,
      })),
    }, null, 2);

    const rawResponse = await generateAIResponse(
      PROMPTS.proposalAssist.system,
      PROMPTS.proposalAssist.user(context),
      3000
    );

    let sections = {
      executiveSummary: '',
      problemStatement: '',
      scope: '',
      deliverables: '',
    };

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        sections = {
          executiveSummary: parsed.executiveSummary || parsed['Executive Summary'] || '',
          problemStatement: parsed.problemStatement || parsed['Problem Statement'] || '',
          scope: parsed.scope || parsed['Proposed Scope of Work'] || parsed.scopeOfWork || '',
          deliverables: parsed.deliverables || parsed['Recommended Deliverables'] || '',
        };
      }
    } catch {
      const sectionRegex = /\d+\.\s*(Executive Summary|Problem Statement|Proposed Scope|Deliverables)[:\s]*/gi;
      const parts = rawResponse.split(sectionRegex);
      if (parts.length >= 5) {
        sections.executiveSummary = parts[2]?.trim() || '';
        sections.problemStatement = parts[4]?.trim() || '';
        sections.scope = parts[6]?.trim() || '';
        sections.deliverables = parts[8]?.trim() || '';
      } else {
        sections.executiveSummary = rawResponse;
      }
    }

    return NextResponse.json({ sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set the ANTHROPIC_API_KEY environment variable.' },
        { status: 400 }
      );
    }
    console.error('POST /api/ai/proposal-assist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
