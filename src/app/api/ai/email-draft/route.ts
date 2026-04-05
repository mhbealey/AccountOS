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

    if (!body.templateId && !body.category) {
      return NextResponse.json(
        { error: 'Either templateId or category is required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      include: {
        contacts: { where: { isPrimary: true }, take: 3 },
        activities: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    let template = null;
    if (body.templateId) {
      template = await prisma.template.findUnique({ where: { id: body.templateId } });
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
    } else if (body.category) {
      template = await prisma.template.findFirst({
        where: { category: body.category },
      });
    }

    const templateContent = template
      ? `Subject: ${template.subject || ''}\nBody: ${template.body}`
      : `Category: ${body.category}\nGenerate an appropriate email from scratch.`;

    const context = JSON.stringify({
      clientName: client.name,
      clientStatus: client.status,
      contacts: client.contacts.map((c: typeof client.contacts[number]) => ({
        name: c.name,
        title: c.title,
      })),
      recentActivities: client.activities.map((a: typeof client.activities[number]) => ({
        type: a.type,
        title: a.title,
        date: a.date.toISOString().split('T')[0],
      })),
    }, null, 2);

    const rawResponse = await generateAIResponse(
      PROMPTS.emailDraft.system,
      PROMPTS.emailDraft.user(templateContent, context),
      1500
    );

    let subject = '';
    let emailBody = rawResponse;

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*"subject"[\s\S]*"body"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        subject = parsed.subject || '';
        emailBody = parsed.body || rawResponse;
      } else {
        const subjectMatch = rawResponse.match(/Subject:\s*(.+)/i);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          emailBody = rawResponse.replace(/Subject:\s*.+\n?/i, '').trim();
        }
      }
    } catch {
      // If parsing fails, use raw response as body
    }

    return NextResponse.json({ subject, body: emailBody });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set the ANTHROPIC_API_KEY environment variable.' },
        { status: 400 }
      );
    }
    console.error('POST /api/ai/email-draft error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
