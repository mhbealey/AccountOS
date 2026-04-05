/**
 * Invoice state machine defining valid status transitions.
 *
 * Valid transitions:
 * - Draft -> Sent
 * - Sent -> Viewed, Paid, Overdue, Void
 * - Viewed -> Paid, Overdue, Void
 * - Overdue -> Paid, Void
 * - Paid -> Void
 * - Void -> (terminal, no outgoing transitions)
 *
 * Invalid transitions (examples):
 * - Paid -> Draft (cannot revert a payment)
 * - Overdue -> Draft (cannot revert to draft)
 * - Void -> anything (void is terminal)
 */

const TRANSITIONS: Record<string, string[]> = {
  Draft: ['Sent', 'Void'],
  Sent: ['Viewed', 'Paid', 'Overdue', 'Void'],
  Viewed: ['Paid', 'Overdue', 'Void'],
  Overdue: ['Paid', 'Void'],
  Paid: ['Void'],
  Void: [],
};

const ALL_STATUSES = Object.keys(TRANSITIONS);

/**
 * Get the list of valid statuses an invoice can transition to from
 * its current status.
 *
 * @param currentStatus - The current invoice status
 * @returns Array of valid target statuses, or empty array if status is unknown
 */
export function getValidTransitions(currentStatus: string): string[] {
  return TRANSITIONS[currentStatus] ?? [];
}

/**
 * Check whether a transition from one status to another is allowed.
 *
 * @param from - The current invoice status
 * @param to - The desired target status
 * @returns true if the transition is valid
 */
export function canTransition(from: string, to: string): boolean {
  const valid = TRANSITIONS[from];
  if (!valid) return false;
  return valid.includes(to);
}

/**
 * Attempt an invoice status transition, returning a result object.
 *
 * @param from - The current invoice status
 * @param to - The desired target status
 * @returns An object with `valid: true` on success, or `valid: false` with an error message
 *
 * @example
 * ```ts
 * const result = transition('Draft', 'Sent');
 * // { valid: true }
 *
 * const bad = transition('Void', 'Draft');
 * // { valid: false, error: 'Cannot transition from "Void" to "Draft". ...' }
 * ```
 */
export function transition(
  from: string,
  to: string
): { valid: boolean; error?: string } {
  if (!ALL_STATUSES.includes(from)) {
    return {
      valid: false,
      error: `Unknown invoice status: "${from}". Valid statuses are: ${ALL_STATUSES.join(', ')}.`,
    };
  }

  if (!ALL_STATUSES.includes(to)) {
    return {
      valid: false,
      error: `Unknown invoice status: "${to}". Valid statuses are: ${ALL_STATUSES.join(', ')}.`,
    };
  }

  if (canTransition(from, to)) {
    return { valid: true };
  }

  const validTargets = getValidTransitions(from);
  const hint =
    validTargets.length > 0
      ? `Valid transitions from "${from}": ${validTargets.join(', ')}.`
      : `"${from}" is a terminal status with no valid transitions.`;

  return {
    valid: false,
    error: `Cannot transition from "${from}" to "${to}". ${hint}`,
  };
}
