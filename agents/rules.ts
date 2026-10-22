/** Agent 3 — Rules: deterministic EUDR / CBAM / Battery validation */
import type {
  AgentResult,
  AuditEntry,
  ExtractedFields,
  Gap,
  Regulation,
} from './types';

export function applyRules(
  fields: ExtractedFields,
  regulation: Regulation
): Gap[] {
  const gaps: Gap[] = [];

  if (regulation === 'EUDR') {
    if (fields.lat == null || fields.lon == null)
      gaps.push({
        code: 'GEO',
        role: 'supplier',
        msg: 'Plot GPS required (6 decimal degrees; polygon if plot >4 ha)',
        severity: 'blocker',
      });
    if (!fields.origin_cert)
      gaps.push({
        code: 'ORIGIN',
        role: 'supplier',
        msg: 'Certificate of origin / legality evidence',
        severity: 'blocker',
      });
    if (!fields.registration)
      gaps.push({
        code: 'KYB',
        role: 'supplier',
        msg: 'Cooperative or company registration',
        severity: 'warning',
      });
    if (!fields.deforestation_free)
      gaps.push({
        code: 'CUTOFF',
        role: 'supplier',
        msg: 'Confirm no deforestation after 31 Dec 2020',
        severity: 'blocker',
      });
  }

  if (regulation === 'CBAM') {
    if (!fields.electricity_kwh && !fields.gas_m3 && !fields.coal_tonnes)
      gaps.push({
        code: 'ENERGY',
        role: 'supplier',
        msg: 'Electricity / fuel bills (kWh, gas, coal)',
        severity: 'blocker',
      });
    if (!fields.production_tonnes)
      gaps.push({
        code: 'PROD',
        role: 'supplier',
        msg: 'Production volume in tonnes',
        severity: 'blocker',
      });
  }

  if (regulation === 'BATTERY') {
    if (!fields.mine_coc)
      gaps.push({
        code: 'ORIGIN_CRM',
        role: 'supplier',
        msg: 'Mine origin + chain of custody for Co/Li/Ni',
        severity: 'blocker',
      });
  }

  return gaps;
}

export async function runRules(
  fields: ExtractedFields,
  regulation: Regulation,
  audit: AuditEntry[]
): Promise<{ result: AgentResult; gaps: Gap[] }> {
  const t0 = Date.now();
  const gaps = applyRules(fields, regulation);
  audit.push({
    at: new Date().toISOString(),
    agent: 'rules',
    event: 'rules_applied',
    data: { regulation, gapCount: gaps.length, codes: gaps.map((g) => g.code) },
  });
  return {
    result: {
      agent: 'rules',
      ok: true,
      durationMs: Date.now() - t0,
      output: { gaps },
    },
    gaps,
  };
}
