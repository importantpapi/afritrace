/**
 * Afritrace Agent Orchestrator
 * Runs the full pipeline: ingest → extract → rules → action → trust → export → reorder
 */
import { runIngest } from './ingest';
import { runExtract } from './extract';
import { runRules } from './rules';
import { runAction } from './action';
import { runTrust } from './trust';
import { runExport } from './export_agent';
import { runReorder } from './reorder';
import type {
  AgentContext,
  AgentResult,
  AuditEntry,
  PassportState,
  Regulation,
} from './types';

function regulationFromProduct(product: string): Regulation {
  const p = product.toLowerCase();
  if (p.includes('steel') || p.includes('aluminum') || p.includes('aluminium'))
    return 'CBAM';
  if (p.includes('cobalt') || p.includes('lithium') || p.includes('battery'))
    return 'BATTERY';
  return 'EUDR';
}

function priceFor(reg: Regulation): number {
  return reg === 'CBAM' ? 1200 : 750;
}

export interface OrchestratorInput {
  supplier: string;
  buyer: string;
  product: string;
  originCountry: string;
  quantity?: string;
  productionDate?: string;
  lat?: number;
  lon?: number;
  rawText: string;
  documentIds?: string[];
}

export async function runPipeline(
  input: OrchestratorInput
): Promise<PassportState> {
  const regulation = regulationFromProduct(input.product);
  const shipmentId = `SP-${Date.now().toString(36).toUpperCase()}`;
  const audit: AuditEntry[] = [];
  const agentRuns: AgentResult[] = [];

  const ctx: AgentContext = {
    shipmentId,
    supplier: input.supplier,
    buyer: input.buyer,
    product: input.product,
    regulation,
    originCountry: input.originCountry,
    quantity: input.quantity,
    productionDate: input.productionDate,
    lat: input.lat,
    lon: input.lon,
    rawText: input.rawText,
    documentIds: input.documentIds,
  };

  audit.push({
    at: new Date().toISOString(),
    agent: 'system',
    event: 'pipeline_started',
    data: { shipmentId, regulation },
  });

  const { result: r1, normalizedText } = await runIngest(ctx, audit);
  agentRuns.push(r1);
  if (!r1.ok) {
    throw new Error(r1.error || 'Ingest failed');
  }

  const { result: r2, fields } = await runExtract(ctx, normalizedText, audit);
  agentRuns.push(r2);

  const { result: r3, gaps } = await runRules(fields, regulation, audit);
  agentRuns.push(r3);

  const { result: r4, tasks } = await runAction(gaps, audit);
  agentRuns.push(r4);

  const { result: r5, trust } = await runTrust(fields, gaps, audit);
  agentRuns.push(r5);

  const { result: r6, passport } = await runExport(
    ctx,
    fields,
    gaps,
    trust,
    priceFor(regulation),
    audit,
    agentRuns
  );
  agentRuns.push(r6);

  const { result: r7, suggestion } = await runReorder(ctx, gaps, audit);
  agentRuns.push(r7);
  passport.reorder_suggestion = suggestion;
  passport.agent_runs = agentRuns;
  passport.audit = audit;

  audit.push({
    at: new Date().toISOString(),
    agent: 'system',
    event: 'pipeline_completed',
    data: { status: passport.status, trust },
  });

  return passport;
}

export { regulationFromProduct, priceFor };
