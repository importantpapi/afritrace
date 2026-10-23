/**
 * Intake agent — multi-source.
 * Live UI: split on --- / SOURCE: name
 * Later: OCR each PDF → same analyseOne → mergeExtracts
 */
import type { ShipmentState } from "../types";

export type SourceAnalysis = {
  name: string;
  text: string;
  signals: string[];
  fields: Record<string, unknown>;
};

export function splitSources(raw: string): { name: string; text: string }[] {
  const parts = raw
    .split(/\n---\n|\n---\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1 && raw.trim()) {
    return [{ name: "pasted_evidence", text: raw.trim() }];
  }
  return parts.map((p, i) => {
    const m = p.match(/^SOURCE:\s*(.+)$/im);
    const name = m ? m[1].trim() : `source_${i + 1}`;
    const text = p.replace(/^SOURCE:\s*.+$/im, "").trim() || p;
    return { name, text };
  });
}

export function analyseOne(text: string): {
  fields: Record<string, unknown>;
  signals: string[];
} {
  const t = (text || "").toLowerCase();
  const fields: Record<string, unknown> = {};
  const signals: string[] = [];
  const gps = text.match(/(-?\d+\.\d{4,})\s*,\s*(-?\d+\.\d{4,})/);
  if (gps) {
    fields.lat = parseFloat(gps[1]);
    fields.lon = parseFloat(gps[2]);
    signals.push("gps");
  }
  if (/certificate|origin|ci-coc|gh-/.test(t)) {
    fields.legal_evidence = true;
    signals.push("legal");
  }
  if (/registration|reg-/.test(t)) {
    fields.supplier_reg = true;
    signals.push("registration");
  }
  if (/deforestation|31 dec 2020|no deforestation/.test(t)) {
    fields.deforestation_free = true;
    signals.push("deforest_claim");
  }
  if (/harvest|production|20\d{2}-/.test(t)) {
    fields.production_date = true;
    signals.push("dates");
  }
  const certs = text.match(/(?:CI|GH)-[A-Z]+-\d{4}-\d+/gi);
  if (certs) {
    fields.cert_ids = certs;
    signals.push("cert_id");
  }
  return { fields, signals };
}

export function mergeExtracts(
  sources: SourceAnalysis[]
): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  for (const s of sources) {
    for (const [k, v] of Object.entries(s.fields)) {
      if (k === "cert_ids") {
        m.cert_ids = [...((m.cert_ids as string[]) || []), ...(v as string[])];
      } else if (m[k] == null) m[k] = v;
    }
  }
  if (m.cert_ids) m.cert_ids = [...new Set(m.cert_ids as string[])];
  return m;
}

export function intakeAgent(state: ShipmentState): ShipmentState {
  const parts = splitSources(state.evidence_text || "");
  const sources: SourceAnalysis[] = parts.map((p) => {
    const a = analyseOne(p.text);
    return { name: p.name, text: p.text, signals: a.signals, fields: a.fields };
  });
  const merged = mergeExtracts(sources);
  state.extracted = { ...merged, _sources: sources.map((s) => s.name) };
  if (merged.lat != null && merged.lon != null) {
    state.plots = [
      {
        lat: merged.lat as number,
        lon: merged.lon as number,
        area_ha: state.plots[0]?.area_ha,
      },
    ];
  }
  state.model_versions.intake = "multi-source-v1";
  return state;
}
