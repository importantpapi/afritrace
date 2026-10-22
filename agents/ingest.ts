/** Agent 1 — Ingest: normalize inputs, hash docs, open audit */
import type { AgentContext, AgentResult, AuditEntry } from './types';

export async function runIngest(
  ctx: AgentContext,
  audit: AuditEntry[]
): Promise<{ result: AgentResult; normalizedText: string }> {
  const t0 = Date.now();
  const text = (ctx.rawText || '').trim();
  if (!text && ctx.lat == null) {
    const result: AgentResult = {
      agent: 'ingest',
      ok: false,
      durationMs: Date.now() - t0,
      output: {},
      error: 'No text or GPS provided',
    };
    return { result, normalizedText: '' };
  }
  audit.push({
    at: new Date().toISOString(),
    agent: 'ingest',
    event: 'documents_normalized',
    data: { chars: text.length, hasGeo: ctx.lat != null },
  });
  return {
    result: {
      agent: 'ingest',
      ok: true,
      durationMs: Date.now() - t0,
      output: { chars: text.length, documentIds: ctx.documentIds || [] },
    },
    normalizedText: text,
  };
}
