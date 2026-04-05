'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { LostReasonDialog } from './LostReasonDialog';
import { WinFactorsDialog } from './WinFactorsDialog';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Deal, DealStageLiteral } from '@/types';

const STAGES: DealStageLiteral[] = [
  'Lead',
  'Discovery',
  'Proposal',
  'Negotiation',
  'ClosedWon',
  'ClosedLost',
];

const STAGE_LABELS: Record<DealStageLiteral, string> = {
  Lead: 'Lead',
  Discovery: 'Discovery',
  Proposal: 'Proposal',
  Negotiation: 'Negotiation',
  ClosedWon: 'Closed Won',
  ClosedLost: 'Closed Lost',
};

interface KanbanBoardProps {
  deals: Deal[];
  onStageDrop: (
    dealId: string,
    newStage: DealStageLiteral,
    extra?: { lostReason?: string; winFactors?: string }
  ) => void;
  onDealClick: (deal: Deal) => void;
}

interface PendingDrop {
  dealId: string;
  deal: Deal;
  newStage: DealStageLiteral;
}

export function KanbanBoard({
  deals,
  onStageDrop,
  onDealClick,
}: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);

  // Mobile stage select
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const dealsByStage = React.useMemo(() => {
    const map: Record<DealStageLiteral, Deal[]> = {
      Lead: [],
      Discovery: [],
      Proposal: [],
      Negotiation: [],
      ClosedWon: [],
      ClosedLost: [],
    };
    for (const deal of deals) {
      if (map[deal.stage]) {
        map[deal.stage].push(deal);
      }
    }
    return map;
  }, [deals]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const dealId = event.active.id as string;
      const deal = deals.find((d) => d.id === dealId);
      if (deal) setActiveDeal(deal);
    },
    [deals]
  );

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // visual feedback handled by useDroppable isOver
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDeal(null);
      const { active, over } = event;
      if (!over) return;

      const dealId = active.id as string;
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) return;

      // Determine target stage from droppable data
      const overData = over.data.current;
      let targetStage: DealStageLiteral | null = null;

      if (overData?.type === 'column') {
        targetStage = overData.stage as DealStageLiteral;
      } else if (overData?.type === 'deal') {
        // Dropped on another deal card - find which column it's in
        const targetDeal = deals.find((d) => d.id === over.id);
        if (targetDeal) targetStage = targetDeal.stage;
      }

      if (!targetStage || targetStage === deal.stage) return;

      if (targetStage === 'ClosedLost') {
        setPendingDrop({ dealId, deal, newStage: targetStage });
        setShowLostDialog(true);
      } else if (targetStage === 'ClosedWon') {
        setPendingDrop({ dealId, deal, newStage: targetStage });
        setShowWinDialog(true);
      } else {
        onStageDrop(dealId, targetStage);
      }
    },
    [deals, onStageDrop]
  );

  const handleLostConfirm = (reason: string) => {
    if (pendingDrop) {
      onStageDrop(pendingDrop.dealId, pendingDrop.newStage, {
        lostReason: reason,
      });
    }
    setShowLostDialog(false);
    setPendingDrop(null);
  };

  const handleLostCancel = () => {
    setShowLostDialog(false);
    setPendingDrop(null);
  };

  const handleWinConfirm = (factors: string) => {
    if (pendingDrop) {
      onStageDrop(pendingDrop.dealId, pendingDrop.newStage, {
        winFactors: factors,
      });
    }
    setShowWinDialog(false);
    setPendingDrop(null);
  };

  const handleWinCancel = () => {
    setShowWinDialog(false);
    setPendingDrop(null);
  };

  const handleMobileStageChange = (deal: Deal, newStage: DealStageLiteral) => {
    if (newStage === deal.stage) return;

    if (newStage === 'ClosedLost') {
      setPendingDrop({ dealId: deal.id, deal, newStage });
      setShowLostDialog(true);
    } else if (newStage === 'ClosedWon') {
      setPendingDrop({ dealId: deal.id, deal, newStage });
      setShowWinDialog(true);
    } else {
      onStageDrop(deal.id, newStage);
    }
  };

  // Mobile: vertical card list grouped by stage
  if (isMobile) {
    return (
      <>
        <div className="space-y-6">
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage];
            if (stageDeals.length === 0) return null;
            const total = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{stageDeals.length}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="space-y-1">
                      <div onClick={() => onDealClick(deal)}>
                        <div className="rounded-xl border border-border/60 bg-[#0f1729] p-3 space-y-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {deal.title}
                            </p>
                            {deal.client && (
                              <p className="text-xs text-muted-foreground">
                                {deal.client.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(deal.value)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {deal.probability}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Select
                        value={deal.stage}
                        onChange={(e) =>
                          handleMobileStageChange(
                            deal,
                            e.target.value as DealStageLiteral
                          )
                        }
                        className="h-8 text-xs"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            Move to: {STAGE_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <LostReasonDialog
          open={showLostDialog}
          onOpenChange={setShowLostDialog}
          onConfirm={handleLostConfirm}
          onCancel={handleLostCancel}
          dealTitle={pendingDrop?.deal.title || ''}
        />
        <WinFactorsDialog
          open={showWinDialog}
          onOpenChange={setShowWinDialog}
          onConfirm={handleWinConfirm}
          onCancel={handleWinCancel}
          dealTitle={pendingDrop?.deal.title || ''}
        />
      </>
    );
  }

  // Desktop: DnD Kanban
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={dealsByStage[stage]}
              onDealClick={onDealClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="w-72">
              <DealCard deal={activeDeal} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LostReasonDialog
        open={showLostDialog}
        onOpenChange={setShowLostDialog}
        onConfirm={handleLostConfirm}
        onCancel={handleLostCancel}
        dealTitle={pendingDrop?.deal.title || ''}
      />
      <WinFactorsDialog
        open={showWinDialog}
        onOpenChange={setShowWinDialog}
        onConfirm={handleWinConfirm}
        onCancel={handleWinCancel}
        dealTitle={pendingDrop?.deal.title || ''}
      />
    </>
  );
}
