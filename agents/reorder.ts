/** Agent 7 — Reorder: suggest next PO after successful pack */
import type { AgentContext, AgentResult, AuditEntry, Gap } from './types';

export async function runReorder(
  ctx: AgentContext,
  gaps: Gap[],
  audit: AuditEntry[]
): Promise<{ result: AgentResult; suggestion: string }> {
  const t0 = Date.now();
  const blockers = gaps.filter((g) => g.severity === 'blocker').length;
  const suggestion = blockers
    ? `Close ${blockers} blocker gap(s) before proposing reorder for ${ctx.product}.`
    : `Propose next ${ctx.product} PO from ${ctx.supplier} to ${ctx.buyer} (same origin ${ctx.originCountry}, same evidence profile).`;

  audit.push({
    at: new Date().toISOString(),
    agent: 'reorder',
    event: 'reorder_suggested',
    data: { suggestion },
  });

  return {
    result: {
      agent: 'reorder',
      ok: true,
      durationMs: Date.now() - t0,
      output: { suggestion },
    },
    suggestion,
  };
}
