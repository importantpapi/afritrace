/** Agent 6 — Export: DDS/CBAM-ready pack object */
import type {
  AgentContext,
  AgentResult,
  AuditEntry,
  ExtractedFields,
  Gap,
  PassportState,
} from './types';

export async function runExport(
  ctx: AgentContext,
  fields: ExtractedFields,
  gaps: Gap[],
  trust: number,
  price: number,
  audit: AuditEntry[],
  agentRuns: AgentResult[]
): Promise<{ result: AgentResult; passport: PassportState }> {
  const t0 = Date.now();
  const blockers = gaps.filter((g) => g.severity === 'blocker').length;
  const passport: PassportState = {
    shipment_id: ctx.shipmentId,
    supplier: ctx.supplier,
    buyer: ctx.buyer,
    product: ctx.product,
    regulation: ctx.regulation,
    origin_country: ctx.originCountry,
    quantity: ctx.quantity,
    production_date: ctx.productionDate || fields.production_date,
    extracted: fields,
    gaps,
    trust_score: trust,
    status: blockers ? 'gaps_found' : 'awaiting_approval',
    approved: false,
    price_eur: price,
    export_pack: {
      format: 'afritrace_v1',
      regulation: ctx.regulation,
      geo: fields.lat != null ? { lat: fields.lat, lon: fields.lon } : null,
      energy: {
        kwh: fields.electricity_kwh,
        gas_m3: fields.gas_m3,
        coal_tonnes: fields.coal_tonnes,
      },
      evidence_keys: Object.keys(fields),
    },
    audit: [...audit],
    agent_runs: agentRuns,
    generated_at: new Date().toISOString(),
    disclaimer:
      'Assistive software — not a legal filing engine. Human approval required before official submission.',
  };

  audit.push({
    at: new Date().toISOString(),
    agent: 'export',
    event: 'pack_built',
    data: { shipment_id: ctx.shipmentId, status: passport.status },
  });
  passport.audit = [...audit];

  return {
    result: {
      agent: 'export',
      ok: true,
      durationMs: Date.now() - t0,
      output: { shipment_id: ctx.shipmentId },
    },
    passport,
  };
}
