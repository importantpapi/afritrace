/** Agent 2 — Extract: structured fields (deterministic + optional LLM) */
import type { AgentContext, AgentResult, AuditEntry, ExtractedFields } from './types';
import { llmExtractFields } from './llm_extract';

export function extractFields(
  text: string,
  ctx: AgentContext
): ExtractedFields {
  const t = (text || '').toLowerCase();
  const f: ExtractedFields = {};

  const gps = t.match(/(-?\d+\.\d{4,})\s*,\s*(-?\d+\.\d{4,})/);
  if (gps) {
    f.lat = +gps[1];
    f.lon = +gps[2];
  } else if (ctx.lat != null && ctx.lon != null) {
    f.lat = ctx.lat;
    f.lon = ctx.lon;
  }

  const cert = t.match(/(?:certificate|origin|ci-coc)[^\n]{0,60}/i);
  if (cert) f.origin_cert = cert[0].slice(0, 80);

  const reg = t.match(/(?:registration|reg\.?|n°)[^\n]{0,60}/i);
  if (reg) f.registration = reg[0].slice(0, 80);

  const kwh = t.match(/([\d,.]+)\s*kwh/i);
  if (kwh) f.electricity_kwh = kwh[1].replace(/,/g, '');

  const gas = t.match(/([\d,.]+)\s*m\s*[³3]/i);
  if (gas) f.gas_m3 = gas[1].replace(/,/g, '');

  const coal = t.match(/([\d,.]+)\s*(?:tonnes?\s+)?coal/i);
  if (coal) f.coal_tonnes = coal[1].replace(/,/g, '');

  const pr = t.match(/([\d,.]+)\s*tonnes?/i);
  if (pr) f.production_tonnes = pr[1].replace(/,/g, '');

  if (/deforestation|31 dec 2020|no deforestation/.test(t))
    f.deforestation_free = true;

  if (/mine|kolwezi|lot-|chain of custody|cobalt|lithium/.test(t))
    f.mine_coc = true;

  const d = t.match(/20\d{2}-\d{2}-\d{2}/);
  if (d) f.production_date = d[0];
  else if (ctx.productionDate) f.production_date = ctx.productionDate;

  return f;
}

export async function runExtract(
  ctx: AgentContext,
  text: string,
  audit: AuditEntry[]
): Promise<{ result: AgentResult; fields: ExtractedFields }> {
  const t0 = Date.now();
  const useLlm = Boolean(process.env.OPENAI_API_KEY);
  const fields = useLlm
    ? await llmExtractFields(text, ctx)
    : extractFields(text, ctx);

  audit.push({
    at: new Date().toISOString(),
    agent: 'extract',
    event: useLlm ? 'fields_extracted_llm' : 'fields_extracted_deterministic',
    data: { keys: Object.keys(fields) },
  });

  return {
    result: {
      agent: 'extract',
      ok: true,
      durationMs: Date.now() - t0,
      output: { fields, mode: useLlm ? 'llm' : 'deterministic' },
    },
    fields,
  };
}
