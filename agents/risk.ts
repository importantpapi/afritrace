/** Risk agent — combines trust + gap severity into buyer-facing risk band */
import type { AgentResult, AuditEntry, Gap } from './types';

export type RiskBand = 'low' | 'medium' | 'high';

export function computeRiskBand(trust: number, gaps: Gap[]): RiskBand {
  const blockers = gaps.filter((g) => g.severity === 'blocker').length;
  if (blockers >= 2 || trust < 40) return 'high';
  if (blockers === 1 || trust < 65) return 'medium';
  return 'low';
}

export async function runRisk(
  trust: number,
  gaps: Gap[],
  audit: AuditEntry[]
): Promise<{ result: AgentResult; band: RiskBand }> {
  const t0 = Date.now();
  const band = computeRiskBand(trust, gaps);
  audit.push({
    at: new Date().toISOString(),
    agent: 'trust',
    event: 'risk_band',
    data: { band, trust, blockers: gaps.filter((g) => g.severity === 'blocker').length },
  });
  return {
    result: {
      agent: 'trust',
      ok: true,
      durationMs: Date.now() - t0,
      output: { band, trust },
    },
    band,
  };
}
