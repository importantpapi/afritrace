/** Intake agent — swap body for OpenAI + OCR later */
import type { ShipmentState } from "../types";

export function intakeAgent(state: ShipmentState): ShipmentState {
  const text = state.evidence_text || "";
  const t = text.toLowerCase();
  const extracted: Record<string, unknown> = {};

  const gps = text.match(/(-?\d+\.\d{4,})\s*,\s*(-?\d+\.\d{4,})/);
  if (gps) {
    extracted.lat = parseFloat(gps[1]);
    extracted.lon = parseFloat(gps[2]);
  }
  if (/certificate|origin|ci-coc|gh-/.test(t)) extracted.legal_evidence = true;
  if (/registration|reg-/.test(t)) extracted.supplier_reg = true;
  if (/deforestation|31 dec 2020|no deforestation/.test(t))
    extracted.deforestation_free = true;
  if (/harvest|production|20\d{2}-/.test(t)) extracted.production_date = true;
  const certs = text.match(/(?:CI|GH)-[A-Z]+-\d{4}-\d+/gi);
  if (certs) extracted.cert_ids = certs;

  state.extracted = extracted;
  if (extracted.lat != null && extracted.lon != null) {
    const area = state.plots[0]?.area_ha;
    state.plots = [
      {
        lat: extracted.lat as number,
        lon: extracted.lon as number,
        area_ha: area,
      },
    ];
  }
  state.model_versions.intake = "regex-v1"; // later: gpt-4o-mini
  return state;
}
