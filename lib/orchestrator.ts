/**
 * Afritrace orchestrator — Higgsfield-style turn runner.
 * Swap tools (OCR/LLM) inside agents later; graph stays the same.
 */
import { intakeAgent } from "./agents/intake";
import { evidenceAgent } from "./agents/evidence";
import { geoAgent } from "./agents/geo";
import { riskAgent } from "./agents/risk";
import { remediationAgent } from "./agents/remediation";
import { packAgent } from "./agents/pack";
import { runEudrRules } from "./rules/eudr";
import { checkpoint, getShipment, saveShipment } from "./store";
import type { ShipmentState } from "./types";

export async function runShipmentTurn(
  shipmentId: string,
  _userMessage?: string
): Promise<ShipmentState> {
  let state = getShipment(shipmentId);
  if (!state) throw new Error("shipment_not_found");

  state.status = "processing";
  state = checkpoint(state, "orchestrator", "turn_start");

  state = intakeAgent(state);
  state = checkpoint(state, "intake", "extracted");

  state = evidenceAgent(state);
  state = checkpoint(state, "evidence", "checklist");

  state = geoAgent(state);
  state = checkpoint(state, "geo", "plots");

  const plot = state.plots[0] || {};
  state.findings = runEudrRules({
    supplier: state.supplier,
    origin: state.origin,
    quantity_kg: state.quantity_kg,
    lat: plot.lat,
    lon: plot.lon,
    area_ha: plot.area_ha,
    has_legal: !!state.extracted.legal_evidence,
    has_deforest: !!state.extracted.deforestation_free,
    has_date: !!state.extracted.production_date || !!state.production_date,
  });
  state = checkpoint(state, "rules", `findings=${state.findings.length}`);

  state = riskAgent(state);
  state = checkpoint(state, "risk", state.risk.level);

  const blockers = state.findings.some((f) => f.severity === "blocker");
  if (blockers) {
    state = remediationAgent(state);
    state.status = "needs_remediation";
    state = checkpoint(state, "remediation", "drafted");
  } else if (state.risk.human_review_required) {
    state.status = "needs_human";
    state = checkpoint(state, "orchestrator", "human_gate");
  }

  // Always build pack draft; paywall controls download
  state = packAgent(state);
  if (state.status === "processing") state.status = "pack_ready";
  else if (!blockers && !state.risk.human_review_required)
    state.status = "pack_ready";

  // If blockers, status stays needs_remediation but pack draft exists
  if (blockers) state.status = "needs_remediation";

  return saveShipment(state);
}

export function createShipment(input: {
  supplier: string;
  buyer: string;
  commodity: string;
  origin: string;
  quantity_kg: number;
  production_date?: string;
  evidence_text: string;
  lat?: number;
  lon?: number;
  area_ha?: number;
}): ShipmentState {
  const id = `shp_${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const state: ShipmentState = {
    shipment_id: id,
    status: "idle",
    supplier: input.supplier,
    buyer: input.buyer,
    commodity: input.commodity,
    origin: input.origin,
    quantity_kg: input.quantity_kg,
    production_date: input.production_date,
    evidence_text: input.evidence_text,
    extracted: {},
    plots: [{ lat: input.lat, lon: input.lon, area_ha: input.area_ha }],
    findings: [],
    risk: { score: 0, level: "—", human_review_required: false },
    remediation: [],
    paid: false,
    price_eur: 750,
    audit: [],
    model_versions: {},
    created_at: now,
    updated_at: now,
  };
  return saveShipment(state);
}

export function markPaid(shipmentId: string): ShipmentState {
  const s = getShipment(shipmentId);
  if (!s) throw new Error("shipment_not_found");
  s.paid = true;
  s.status = "paid";
  return checkpoint(s, "billing", "paid");
}
