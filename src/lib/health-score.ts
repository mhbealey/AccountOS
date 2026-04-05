import type { HealthScoreParams, HealthScoreResult } from '@/types';

/** Default weight configuration for health score components. */
const DEFAULT_WEIGHTS: Record<string, number> = {
  engagement: 0.25,
  satisfaction: 0.20,
  payment: 0.20,
  adoption: 0.15,
  csmPulse: 0.20,
};

/**
 * Calculate a composite health score for a client account.
 *
 * Uses a weighted formula across five dimensions. When satisfaction or adoption
 * scores are unavailable (null), their weight is redistributed proportionally
 * among the remaining dimensions.
 *
 * Engagement uses exponential decay based on days since last contact:
 *   `engagementScore = 100 * e^(-0.05 * daysSinceContact)`
 *
 * This models the natural decay of relationship engagement over time --
 * a client contacted yesterday scores ~95, while one not contacted in
 * 30 days scores ~22.
 *
 * @param params - The input parameters for health calculation
 * @param params.daysSinceContact - Number of days since last meaningful contact
 * @param params.satisfactionScore - Client satisfaction (0-100), or null if unknown
 * @param params.invoiceOnTimePercentage - Percentage of invoices paid on time (0-100)
 * @param params.adoptionScore - Product/service adoption metric (0-100), or null if unknown
 * @param params.csmPulse - CSM's subjective assessment of account health (0-100)
 * @returns A breakdown of all health score components and the weighted total
 *
 * @example
 * ```ts
 * const result = calculateHealthScore({
 *   daysSinceContact: 5,
 *   satisfactionScore: 85,
 *   invoiceOnTimePercentage: 100,
 *   adoptionScore: 70,
 *   csmPulse: 80,
 * });
 * // result.total => 83
 * ```
 */
export function calculateHealthScore(params: HealthScoreParams): HealthScoreResult {
  const {
    daysSinceContact,
    satisfactionScore,
    invoiceOnTimePercentage,
    adoptionScore,
    csmPulse,
  } = params;

  // Calculate engagement via exponential decay
  const engagementRaw = Math.round(
    100 * Math.exp(-0.05 * Math.max(0, daysSinceContact))
  );
  const engagement = clamp(engagementRaw, 0, 100);

  // Payment score is directly the on-time percentage
  const payment = clamp(Math.round(invoiceOnTimePercentage), 0, 100);

  // CSM pulse is used directly
  const csmPulseClamped = clamp(Math.round(csmPulse), 0, 100);

  // Build the active weights map, redistributing from null dimensions
  const weights = { ...DEFAULT_WEIGHTS };
  let nullWeight = 0;
  let activeCount = 0;

  if (satisfactionScore === null) {
    nullWeight += weights.satisfaction;
    weights.satisfaction = 0;
  } else {
    activeCount++;
  }

  if (adoptionScore === null) {
    nullWeight += weights.adoption;
    weights.adoption = 0;
  } else {
    activeCount++;
  }

  // Always-present dimensions
  const alwaysPresent: string[] = ['engagement', 'payment', 'csmPulse'];
  const activeKeys: string[] = [
    ...alwaysPresent,
    ...(satisfactionScore !== null ? ['satisfaction'] : []),
    ...(adoptionScore !== null ? ['adoption'] : []),
  ];

  // Redistribute null weight proportionally among active dimensions
  if (nullWeight > 0) {
    const totalActiveWeight = activeKeys.reduce((sum, k) => sum + weights[k], 0);
    for (const key of activeKeys) {
      weights[key] += nullWeight * (weights[key] / totalActiveWeight);
    }
  }

  // Calculate weighted total
  const satisfactionClamped = satisfactionScore !== null
    ? clamp(Math.round(satisfactionScore), 0, 100)
    : null;
  const adoptionClamped = adoptionScore !== null
    ? clamp(Math.round(adoptionScore), 0, 100)
    : null;

  const total = Math.round(
    engagement * weights.engagement +
    (satisfactionClamped ?? 0) * weights.satisfaction +
    payment * weights.payment +
    (adoptionClamped ?? 0) * weights.adoption +
    csmPulseClamped * weights.csmPulse
  );

  return {
    total: clamp(total, 0, 100),
    engagement,
    satisfaction: satisfactionClamped,
    payment,
    adoption: adoptionClamped,
    csmPulse: csmPulseClamped,
  };
}

/** Clamp a number between min and max (inclusive). */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
