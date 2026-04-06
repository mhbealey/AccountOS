import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { phaseId, status, notes } = body;

    if (!phaseId || !status) {
      return NextResponse.json(
        { error: 'phaseId and status are required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify phase belongs to this client
    const phase = await prisma.journeyPhase.findUnique({
      where: { id: phaseId },
    });
    if (!phase || phase.clientId !== id) {
      return NextResponse.json({ error: 'Journey phase not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (status === 'in_progress' && phase.status !== 'in_progress') {
      updateData.startedAt = new Date();
    }
    if (status === 'completed' && phase.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedPhase = await prisma.journeyPhase.update({
      where: { id: phaseId },
      data: updateData,
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        clientId: id,
        type: 'journey_update',
        title: `Journey phase "${phase.phase}" updated to ${status}`,
        details: notes ?? null,
      },
    });

    return NextResponse.json(updatedPhase);
  } catch (error) {
    console.error('PATCH /clients/[id]/journey error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
