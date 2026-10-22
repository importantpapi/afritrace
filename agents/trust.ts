/** Agent 5 — Trust: evidence score 0–100 */
import type { AgentResult, AuditEntry, ExtractedFields, Gap } from './types';

export function computeTrust(fields: ExtractedFields, gaps: Gap[]): number {
  let t = 35;
  if (fields.lat != null) t += 12;
  if (fields.origin_cert) t += 12;
  if (fields.registration) t += 10;
  if (fields.deforestation_free) t += 10;
  if (fields.electricity_kwh || fields.gas_m3) t += 15;
  if (fields.production_tonnes) t += 12;
  if (fields.mine_coc) t += 20;
  t -= gaps.filter((g) => g.severity === 'blocker').length * 10;
  t -= gaps.filter((g) => g.severity === 'warning').length * 4;
  return Math.max(5, Math.min(98, t));
}

export async function runTrust(
  fields: ExtractedFields,
  gaps: Gap[],
  audit: AuditEntry[]
): Promise<{ result: AgentResult; trust: number }> {
  const t0 = Date.now();
  const trust = computeTrust(fields, gaps);
  audit.push({
    at: new Date().toISOString(),
    agent: 'trust',
    event: 'trust_scored',
    data: { trust },
  });
  return {
    result: {
      agent: 'trust',
      ok: true,
      durationMs: Date.now() - t0,
      output: { trust },
    },
    trust,
  };
}
